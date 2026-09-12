import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getDb, hasDatabase } from "@/lib/mongodb";

const MAX_EMAIL_LENGTH = 320;

export async function POST(request: NextRequest) {
  if (!hasDatabase()) {
    return NextResponse.json({ error: "Newsletter storage is not configured yet." }, { status: 503 });
  }

  const body = await request.json().catch(() => null) as { email?: string } | null;
  const email = String(body?.email || "").trim().toLowerCase();
  if (
    !email ||
    email.length > MAX_EMAIL_LENGTH ||
    !/^\S+@\S+\.\S+$/.test(email)
  ) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const db = await getDb();
  const subscribers = db.collection("newsletter_subscribers");
  await subscribers.createIndex({ email: 1 }, { unique: true });

  const existing = await subscribers.findOne(
    { email },
    { projection: { status: 1, unsubscribeToken: 1 } },
  );
  const now = new Date().toISOString();
  const unsubscribeToken =
    existing?.status === "unsubscribed" || !existing?.unsubscribeToken
      ? randomBytes(24).toString("hex")
      : String(existing.unsubscribeToken);

  await subscribers.updateOne(
    { email },
    {
      $set: { status: "active", updatedAt: now, unsubscribeToken },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true },
  );

  return NextResponse.json({ ok: true });
}
