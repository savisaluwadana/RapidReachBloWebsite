import { createHash, randomBytes } from "node:crypto";
import { MongoServerError, ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { getDb, hasDatabase } from "@/lib/mongodb";

const MAX_SLUG_LENGTH = 180;
const COMMENT_DEDUPE_WINDOW_MS = 60_000;
const COMMENT_RATE_WINDOW_MS = 10 * 60_000;
const COMMENT_RATE_LIMIT = 5;
let commentIndexesPromise: Promise<void> | null = null;

function noStoreJson(body: unknown, init?: { status?: number }) {
  return NextResponse.json(body, {
    ...init,
    headers: { "cache-control": "private, no-store" },
  });
}

async function ensureCommentIndexes() {
  if (!commentIndexesPromise) {
    commentIndexesPromise = (async () => {
      const db = await getDb();
      await Promise.all([
        db.collection("comments").createIndex({ postSlug: 1, createdAt: -1 }),
        db.collection("comments").createIndex({ dedupeKey: 1 }, { unique: true, sparse: true }),
        db.collection("comments").createIndex({ rateKey: 1, createdAt: -1 }, { sparse: true }),
        db.collection("comments").createIndex({ editTokenHash: 1 }, { sparse: true }),
      ]);
    })().catch((error) => {
      commentIndexesPromise = null;
      throw error;
    });
  }
  return commentIndexesPromise;
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function commentDedupeKey(slug: string, name: string, body: string, now: number) {
  const bucket = Math.floor(now / COMMENT_DEDUPE_WINDOW_MS);
  return createHash("sha256")
    .update(`${slug}\n${name.toLowerCase()}\n${body}\n${bucket}`)
    .digest("hex");
}

function requestRateKey(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip")?.trim();
  if (!ip) return null;
  const userAgent = request.headers.get("user-agent") || "unknown";
  const salt = process.env.COMMENT_RATE_LIMIT_SALT || "rapidreach-comment-rate-limit";
  return createHash("sha256").update(`${salt}\n${ip}\n${userAgent}`).digest("hex");
}

function cleanBody(value: unknown) {
  return String(value || "").trim().slice(0, 1200);
}

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug")?.trim().slice(0, MAX_SLUG_LENGTH);
  if (!slug) return noStoreJson({ comments: [] });
  if (!hasDatabase()) return noStoreJson({ comments: [] });

  const db = await getDb();
  const post = await db.collection("posts").findOne(
    { slug, status: "published" },
    { projection: { _id: 1 } },
  );
  if (!post) return noStoreJson({ error: "Article not found.", comments: [] }, { status: 404 });

  const docs = await db.collection("comments")
    .find({ postSlug: slug, status: { $ne: "hidden" } })
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();

  return noStoreJson({
    comments: docs.map((doc) => ({
      _id: String(doc._id),
      name: String(doc.name),
      body: String(doc.body),
      createdAt: String(doc.createdAt),
      editedAt: doc.editedAt ? String(doc.editedAt) : undefined,
    })),
  });
}

export async function POST(request: NextRequest) {
  if (!hasDatabase()) return noStoreJson({ error: "Comments require MongoDB configuration." }, { status: 503 });

  const input = await request.json().catch(() => ({}));
  const slug = String(input.slug || "").trim().slice(0, MAX_SLUG_LENGTH);
  const name = String(input.name || "").trim().slice(0, 60);
  const body = cleanBody(input.body);
  if (!slug || name.length < 1 || body.length < 2) {
    return noStoreJson({ error: "Name and comment are required." }, { status: 400 });
  }

  const db = await getDb();
  const post = await db.collection("posts").findOne(
    { slug, status: "published" },
    { projection: { _id: 1 } },
  );
  if (!post) return noStoreJson({ error: "Article not found." }, { status: 404 });

  await ensureCommentIndexes();
  const now = Date.now();
  const createdAt = new Date(now).toISOString();
  const dedupeKey = commentDedupeKey(slug, name, body, now);
  const rateKey = requestRateKey(request);

  if (rateKey) {
    const recentComments = await db.collection("comments").countDocuments({
      rateKey,
      createdAt: { $gte: new Date(now - COMMENT_RATE_WINDOW_MS).toISOString() },
    });
    if (recentComments >= COMMENT_RATE_LIMIT) {
      return noStoreJson({ error: "Too many comments submitted. Try again in a few minutes." }, { status: 429 });
    }
  }

  const editToken = randomBytes(32).toString("base64url");

  try {
    const result = await db.collection("comments").insertOne({
      postSlug: slug,
      name,
      body,
      createdAt,
      status: "visible",
      dedupeKey,
      editTokenHash: hashToken(editToken),
      ...(rateKey ? { rateKey } : {}),
    });
    return noStoreJson({
      comment: { _id: String(result.insertedId), name, body, createdAt },
      editToken,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      return noStoreJson({ error: "That comment was already submitted." }, { status: 409 });
    }
    throw error;
  }
}

export async function PATCH(request: NextRequest) {
  if (!hasDatabase()) return noStoreJson({ error: "Comments require MongoDB configuration." }, { status: 503 });

  const input = await request.json().catch(() => ({}));
  const id = String(input.id || "").trim();
  const slug = String(input.slug || "").trim().slice(0, MAX_SLUG_LENGTH);
  const token = String(input.token || "").trim();
  const body = cleanBody(input.body);
  if (!ObjectId.isValid(id) || !slug || !token || body.length < 2) {
    return noStoreJson({ error: "A valid comment and comment text are required." }, { status: 400 });
  }

  const db = await getDb();
  const editedAt = new Date().toISOString();
  const result = await db.collection("comments").updateOne(
    { _id: new ObjectId(id), postSlug: slug, editTokenHash: hashToken(token), status: { $ne: "hidden" } },
    { $set: { body, editedAt } },
  );

  if (!result.matchedCount) {
    return noStoreJson({ error: "This comment can no longer be edited from this browser." }, { status: 403 });
  }

  return noStoreJson({ comment: { _id: id, body, editedAt } });
}

export async function DELETE(request: NextRequest) {
  if (!hasDatabase()) return noStoreJson({ error: "Comments require MongoDB configuration." }, { status: 503 });

  const input = await request.json().catch(() => ({}));
  const id = String(input.id || "").trim();
  const slug = String(input.slug || "").trim().slice(0, MAX_SLUG_LENGTH);
  const token = String(input.token || "").trim();
  if (!ObjectId.isValid(id) || !slug || !token) {
    return noStoreJson({ error: "A valid comment is required." }, { status: 400 });
  }

  const db = await getDb();
  const result = await db.collection("comments").deleteOne({
    _id: new ObjectId(id),
    postSlug: slug,
    editTokenHash: hashToken(token),
  });

  if (!result.deletedCount) {
    return noStoreJson({ error: "This comment can no longer be deleted from this browser." }, { status: 403 });
  }

  return noStoreJson({ ok: true });
}
