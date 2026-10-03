import { createHash, randomBytes } from "node:crypto";
import { MongoServerError } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { ensureDatabaseIndexes } from "@/lib/db-indexes";
import { getDb, hasDatabase } from "@/lib/mongodb";

const MAX_EMAIL_LENGTH = 320;
const MAX_SOURCE_PATH_LENGTH = 180;
const SIGNUP_RATE_WINDOW_MS = 60 * 60 * 1000;
const SIGNUP_RATE_LIMIT = 10;

function signupSourcePath(request: NextRequest) {
  const referer = request.headers.get("referer");
  if (!referer) return undefined;
  try {
    return new URL(referer).pathname.slice(0, MAX_SOURCE_PATH_LENGTH) || "/";
  } catch {
    return undefined;
  }
}

function signupRateKey(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  const salt = process.env.NEWSLETTER_RATE_LIMIT_SALT || process.env.COMMENT_RATE_LIMIT_SALT || "rapidreach-newsletter-rate";
  return createHash("sha256").update(`${salt}\n${ip}\n${userAgent}`).digest("hex");
}

export async function POST(request: NextRequest) {
  if (!hasDatabase()) {
    return NextResponse.json({ error: "Newsletter storage is not configured yet." }, { status: 503 });
  }

  const body = await request.json().catch(() => null) as { email?: string } | null;
  const email = String(body?.email || "").trim().toLowerCase();
  if (!email || email.length > MAX_EMAIL_LENGTH || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const db = await getDb();
  await ensureDatabaseIndexes(db);

  const rateKey = signupRateKey(request);
  const nowDate = new Date();
  const recent = await db.collection("newsletter_signup_events").countDocuments({
    key: rateKey,
    createdAt: { $gte: new Date(nowDate.getTime() - SIGNUP_RATE_WINDOW_MS) },
  });
  if (recent >= SIGNUP_RATE_LIMIT) {
    return NextResponse.json({ error: "Too many subscription attempts. Try again later." }, { status: 429 });
  }
  await db.collection("newsletter_signup_events").insertOne({
    key: rateKey,
    createdAt: nowDate,
    expiresAt: new Date(nowDate.getTime() + SIGNUP_RATE_WINDOW_MS * 2),
  });

  const subscribers = db.collection("newsletter_subscribers");
  const now = nowDate.toISOString();
  const sourcePath = signupSourcePath(request);
  const unsubscribeToken = randomBytes(24).toString("hex");

  let previous;
  try {
    previous = await subscribers.findOneAndUpdate(
      { email },
      {
        $set: {
          status: "active",
          updatedAt: now,
          lastSignupAt: now,
          ...(sourcePath ? { lastSourcePath: sourcePath } : {}),
        },
        $setOnInsert: {
          email,
          createdAt: now,
          subscribedAt: now,
          unsubscribeToken,
          ...(sourcePath ? { sourcePath } : {}),
        },
      },
      { upsert: true, returnDocument: "before", projection: { status: 1, unsubscribeToken: 1 } },
    );
  } catch (error) {
    if (!(error instanceof MongoServerError) || error.code !== 11000) throw error;
    previous = await subscribers.findOne({ email }, { projection: { status: 1, unsubscribeToken: 1 } });
    await subscribers.updateOne(
      { email },
      { $set: { status: "active", updatedAt: now, lastSignupAt: now, ...(sourcePath ? { lastSourcePath: sourcePath } : {}) } },
    );
  }

  const current = await subscribers.findOne({ email }, { projection: { unsubscribeToken: 1 } });
  if (!current?.unsubscribeToken) {
    await subscribers.updateOne({ email }, { $set: { unsubscribeToken: randomBytes(24).toString("hex") } });
  }

  const alreadySubscribed = previous?.status === "active";
  const resubscribed = previous?.status === "unsubscribed";
  if (resubscribed) {
    await subscribers.updateOne({ email }, { $set: { resubscribedAt: now } });
  }

  return NextResponse.json(
    { ok: true, alreadySubscribed, resubscribed },
    { status: previous ? 200 : 201 },
  );
}
