import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getDb, hasDatabase } from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  if (!hasDatabase()) return NextResponse.json({ error: "Newsletter storage is not configured yet." }, { status: 503 });
  const body = await request.json().catch(() => null) as { email?: string } | null;
  const email = String(body?.email || "").trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  const db = await getDb();
  await db.collection("newsletter_subscribers").createIndex({ email: 1 }, { unique: true });
  const now = new Date().toISOString();
  await db.collection("newsletter_subscribers").updateOne(
    { email },
    { $set: { status: "active", updatedAt: now }, $setOnInsert: { createdAt: now, unsubscribeToken: randomBytes(24).toString("hex") } },
    { upsert: true },
  );
  return NextResponse.json({ ok: true });
}
