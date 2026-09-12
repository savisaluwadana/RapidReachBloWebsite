import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getDb, hasDatabase } from "@/lib/mongodb";

const MAX_EMAIL_LENGTH = 320;
const MAX_SOURCE_PATH_LENGTH = 180;

function signupSourcePath(request: NextRequest) {
  const referer = request.headers.get("referer");
  if (!referer) return undefined;
  try {
    return new URL(referer).pathname.slice(0, MAX_SOURCE_PATH_LENGTH) || "/";
  } catch {
    return undefined;
  }
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
  const subscribers = db.collection("newsletter_subscribers");
  await subscribers.createIndex({ email: 1 }, { unique: true, name: "unique_newsletter_email" });

  const existing = await subscribers.findOne(
    { email },
    { projection: { status: 1, unsubscribeToken: 1 } },
  );
  const now = new Date().toISOString();
  const sourcePath = signupSourcePath(request);

  if (existing?.status === "unsubscribed") {
    await subscribers.updateOne(
      { email },
      {
        $set: {
          lastSignupAttemptAt: now,
          ...(sourcePath ? { lastSourcePath: sourcePath } : {}),
        },
      },
    );
    return NextResponse.json(
      { error: "This address is currently unsubscribed. Use the subscription-management link from a previous RapidReach email to resubscribe." },
      { status: 409 },
    );
  }

  if (existing?.status === "active") {
    await subscribers.updateOne(
      { email },
      {
        $set: {
          updatedAt: now,
          lastSignupAt: now,
          ...(sourcePath ? { lastSourcePath: sourcePath } : {}),
        },
      },
    );
    return NextResponse.json({ ok: true, alreadySubscribed: true });
  }

  const unsubscribeToken = randomBytes(24).toString("hex");
  await subscribers.insertOne({
    email,
    status: "active",
    createdAt: now,
    subscribedAt: now,
    updatedAt: now,
    lastSignupAt: now,
    unsubscribeToken,
    ...(sourcePath ? { sourcePath, lastSourcePath: sourcePath } : {}),
  });

  return NextResponse.json({ ok: true, alreadySubscribed: false }, { status: 201 });
}
