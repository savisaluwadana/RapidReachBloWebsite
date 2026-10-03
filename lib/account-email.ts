import { createHash, randomBytes } from "node:crypto";
import { ObjectId } from "mongodb";
import { ensureDatabaseIndexes } from "@/lib/db-indexes";
import { getDb, hasDatabase } from "@/lib/mongodb";
import { normalizedSiteUrl } from "@/lib/public-format";
import { hashPassword } from "@/lib/auth";

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;
const RESET_TTL_MS = 60 * 60 * 1000;
const MAX_TOKEN_EMAILS_PER_HOUR = 3;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function sender() {
  return process.env.ACCOUNT_FROM_EMAIL?.trim() || process.env.BRIEFING_FROM_EMAIL?.trim() || "";
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[char] || char));
}

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = sender();
  if (!apiKey || !from) return false;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
      "user-agent": "RapidReach/1.0",
    },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });
  if (!response.ok) {
    console.error("RapidReach account email failed", response.status, await response.text().catch(() => ""));
    return false;
  }
  return true;
}

async function createToken(userId: string, kind: "verify-email" | "reset-password", ttlMs: number) {
  const db = await getDb();
  await ensureDatabaseIndexes(db);
  const collection = db.collection("account_tokens");
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const recent = await collection.countDocuments({ userId, kind, createdAt: { $gte: since } });
  if (recent >= MAX_TOKEN_EMAILS_PER_HOUR) return null;

  await collection.deleteMany({ userId, kind });
  const token = randomBytes(32).toString("base64url");
  const now = new Date();
  await collection.insertOne({
    userId,
    kind,
    tokenHash: hashToken(token),
    createdAt: now,
    expiresAt: new Date(now.getTime() + ttlMs),
  });
  return token;
}

export function accountEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim() && sender());
}

export async function sendVerificationEmail(userId: string, email: string) {
  if (!hasDatabase() || !accountEmailConfigured()) return false;
  const token = await createToken(userId, "verify-email", VERIFY_TTL_MS);
  if (!token) return true;

  const link = `${normalizedSiteUrl()}/api/account/verify-email?token=${encodeURIComponent(token)}`;
  return sendEmail(
    email,
    "Verify your RapidReach email",
    `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#111"><h1>Verify your email</h1><p>Confirm this email address for your RapidReach account.</p><p><a href="${escapeHtml(link)}">Verify email address</a></p><p>This link expires in 24 hours.</p></div>`,
  );
}

export async function verifyEmailToken(token: string) {
  if (!hasDatabase() || !token || token.length > 200) return false;
  const db = await getDb();
  await ensureDatabaseIndexes(db);
  const tokenHash = hashToken(token);
  const entry = await db.collection("account_tokens").findOneAndDelete({
    kind: "verify-email",
    tokenHash,
    expiresAt: { $gt: new Date() },
  });
  if (!entry?.userId || !ObjectId.isValid(String(entry.userId))) return false;

  const now = new Date().toISOString();
  const result = await db.collection("users").updateOne(
    { _id: new ObjectId(String(entry.userId)), status: { $ne: "disabled" } },
    { $set: { emailVerifiedAt: now, updatedAt: now } },
  );
  return result.matchedCount === 1;
}

export async function requestPasswordResetEmail(email: string) {
  if (!hasDatabase()) return { configured: false };
  const db = await getDb();
  await ensureDatabaseIndexes(db);
  if (!accountEmailConfigured()) return { configured: false };

  const user = await db.collection("users").findOne(
    { email: email.trim().toLowerCase(), status: { $ne: "disabled" } },
    { projection: { _id: 1, email: 1 } },
  );
  if (!user) return { configured: true };

  const token = await createToken(String(user._id), "reset-password", RESET_TTL_MS);
  if (!token) return { configured: true };
  const link = `${normalizedSiteUrl()}/reset-password?token=${encodeURIComponent(token)}`;
  await sendEmail(
    String(user.email),
    "Reset your RapidReach password",
    `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#111"><h1>Reset your password</h1><p>Use the link below to choose a new RapidReach password.</p><p><a href="${escapeHtml(link)}">Reset password</a></p><p>This link expires in one hour. If you did not request this, you can ignore this email.</p></div>`,
  );
  return { configured: true };
}

export async function resetPasswordWithToken(token: string, password: string) {
  if (!hasDatabase() || !token || token.length > 200 || password.length < 10 || password.length > 1024) {
    return { ok: false as const, error: "That password reset link is invalid or the password does not meet the requirements." };
  }

  const db = await getDb();
  await ensureDatabaseIndexes(db);
  const tokenHash = hashToken(token);
  const entry = await db.collection("account_tokens").findOneAndDelete({
    kind: "reset-password",
    tokenHash,
    expiresAt: { $gt: new Date() },
  });
  if (!entry?.userId || !ObjectId.isValid(String(entry.userId))) {
    return { ok: false as const, error: "That password reset link is invalid or has expired." };
  }

  const userId = String(entry.userId);
  const now = new Date().toISOString();
  const result = await db.collection("users").updateOne(
    { _id: new ObjectId(userId), status: { $ne: "disabled" } },
    { $set: { passwordHash: await hashPassword(password), updatedAt: now, passwordChangedAt: now } },
  );
  if (!result.matchedCount) return { ok: false as const, error: "That account is no longer available." };

  await Promise.all([
    db.collection("sessions").deleteMany({ userId }),
    db.collection("account_tokens").deleteMany({ userId }),
  ]);
  return { ok: true as const };
}
