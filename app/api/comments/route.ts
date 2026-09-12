import { createHash } from "node:crypto";
import { MongoServerError, ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
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
        db.collection("comments").createIndex({ userId: 1, createdAt: -1 }, { sparse: true }),
        db.collection("comments").createIndex({ dedupeKey: 1 }, { unique: true, sparse: true }),
        db.collection("comments").createIndex({ rateKey: 1, createdAt: -1 }, { sparse: true }),
      ]);
    })().catch((error) => {
      commentIndexesPromise = null;
      throw error;
    });
  }
  return commentIndexesPromise;
}

function commentDedupeKey(slug: string, userId: string, body: string, now: number) {
  const bucket = Math.floor(now / COMMENT_DEDUPE_WINDOW_MS);
  return createHash("sha256")
    .update(`${slug}\n${userId}\n${body}\n${bucket}`)
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

  const [db, user] = await Promise.all([getDb(), getCurrentUser()]);
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
      name: String(doc.name || "User"),
      body: String(doc.body),
      createdAt: String(doc.createdAt),
      editedAt: doc.editedAt ? String(doc.editedAt) : undefined,
      editable: Boolean(user && doc.userId && String(doc.userId) === user.id),
    })),
  });
}

export async function POST(request: NextRequest) {
  if (!hasDatabase()) return noStoreJson({ error: "Comments require MongoDB configuration." }, { status: 503 });

  const user = await getCurrentUser();
  if (!user) return noStoreJson({ error: "Sign in to publish a comment." }, { status: 401 });

  const input = await request.json().catch(() => ({}));
  const slug = String(input.slug || "").trim().slice(0, MAX_SLUG_LENGTH);
  const body = cleanBody(input.body);
  if (!slug || body.length < 2) {
    return noStoreJson({ error: "Comment text is required." }, { status: 400 });
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
  const dedupeKey = commentDedupeKey(slug, user.id, body, now);
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

  try {
    const result = await db.collection("comments").insertOne({
      postSlug: slug,
      userId: user.id,
      name: user.name,
      body,
      createdAt,
      status: "visible",
      dedupeKey,
      ...(rateKey ? { rateKey } : {}),
    });
    return noStoreJson({
      comment: { _id: String(result.insertedId), name: user.name, body, createdAt, editable: true },
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

  const user = await getCurrentUser();
  if (!user) return noStoreJson({ error: "Sign in to edit a comment." }, { status: 401 });

  const input = await request.json().catch(() => ({}));
  const id = String(input.id || "").trim();
  const slug = String(input.slug || "").trim().slice(0, MAX_SLUG_LENGTH);
  const body = cleanBody(input.body);
  if (!ObjectId.isValid(id) || !slug || body.length < 2) {
    return noStoreJson({ error: "A valid comment and comment text are required." }, { status: 400 });
  }

  const db = await getDb();
  const editedAt = new Date().toISOString();
  const result = await db.collection("comments").updateOne(
    { _id: new ObjectId(id), postSlug: slug, userId: user.id, status: { $ne: "hidden" } },
    { $set: { body, editedAt } },
  );

  if (!result.matchedCount) {
    return noStoreJson({ error: "You can only edit your own comments." }, { status: 403 });
  }

  return noStoreJson({ comment: { _id: id, body, editedAt } });
}

export async function DELETE(request: NextRequest) {
  if (!hasDatabase()) return noStoreJson({ error: "Comments require MongoDB configuration." }, { status: 503 });

  const user = await getCurrentUser();
  if (!user) return noStoreJson({ error: "Sign in to delete a comment." }, { status: 401 });

  const input = await request.json().catch(() => ({}));
  const id = String(input.id || "").trim();
  const slug = String(input.slug || "").trim().slice(0, MAX_SLUG_LENGTH);
  if (!ObjectId.isValid(id) || !slug) {
    return noStoreJson({ error: "A valid comment is required." }, { status: 400 });
  }

  const db = await getDb();
  const result = await db.collection("comments").deleteOne({
    _id: new ObjectId(id),
    postSlug: slug,
    userId: user.id,
  });

  if (!result.deletedCount) {
    return noStoreJson({ error: "You can only delete your own comments." }, { status: 403 });
  }

  return noStoreJson({ ok: true });
}
