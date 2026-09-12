import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { MongoServerError, ObjectId } from "mongodb";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getDb, hasDatabase } from "@/lib/mongodb";
import type { User, UserRole } from "@/lib/types";

const scrypt = promisify(scryptCallback);
const SESSION_COOKIE = "rapidreach_session";
const SESSION_DAYS = 30;
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 320;
const MIN_PASSWORD_LENGTH = 10;
const MAX_PASSWORD_LENGTH = 1024;
const AUTH_RATE_COLLECTION = "auth_rate_events";
const LOGIN_RATE_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_RATE_LIMIT = 10;
const REGISTER_RATE_WINDOW_MS = 30 * 60 * 1000;
const REGISTER_RATE_LIMIT = 5;
let indexesPromise: Promise<void> | null = null;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function validEmail(email: string) {
  return Boolean(email && email.length <= MAX_EMAIL_LENGTH && /^\S+@\S+\.\S+$/.test(email));
}

function validPasswordLength(password: string) {
  return password.length >= MIN_PASSWORD_LENGTH && password.length <= MAX_PASSWORD_LENGTH;
}

function secretsEqual(actual: string, expected: string) {
  const actualHash = createHash("sha256").update(actual).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  return timingSafeEqual(actualHash, expectedHash);
}

function publicUser(doc: Record<string, unknown>): User {
  return {
    id: String(doc._id),
    name: String(doc.name || "Developer"),
    email: String(doc.email || ""),
    role: doc.role === "admin" ? "admin" : "user",
    status: doc.status === "disabled" ? "disabled" : "active",
    createdAt: String(doc.createdAt || new Date().toISOString()),
    updatedAt: doc.updatedAt ? String(doc.updatedAt) : undefined,
  };
}

async function ensureAccountIndexes() {
  if (!indexesPromise) {
    indexesPromise = (async () => {
      const db = await getDb();
      await Promise.all([
        db.collection("users").createIndex({ email: 1 }, { unique: true }),
        db.collection("sessions").createIndex({ tokenHash: 1 }, { unique: true }),
        db.collection("sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
        db.collection("tool_submissions").createIndex({ userId: 1, updatedAt: -1 }),
        db.collection("tool_submissions").createIndex({ status: 1, updatedAt: -1 }),
        db.collection(AUTH_RATE_COLLECTION).createIndex({ key: 1, createdAt: -1 }),
        db.collection(AUTH_RATE_COLLECTION).createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      ]);
    })().catch((error) => {
      indexesPromise = null;
      throw error;
    });
  }
  return indexesPromise;
}

async function requestFingerprint() {
  const requestHeaders = await headers();
  const forwarded = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || requestHeaders.get("x-real-ip")?.trim() || "unknown";
  const userAgent = requestHeaders.get("user-agent") || "unknown";
  return createHash("sha256").update(`${ip}\n${userAgent}`).digest("hex");
}

async function rateState(kind: "login" | "register", subject: string, limit: number, windowMs: number) {
  await ensureAccountIndexes();
  const db = await getDb();
  const fingerprint = await requestFingerprint();
  const key = createHash("sha256").update(`${kind}\n${subject}\n${fingerprint}`).digest("hex");
  const since = new Date(Date.now() - windowMs);
  const count = await db.collection(AUTH_RATE_COLLECTION).countDocuments({ key, createdAt: { $gte: since } });
  return { db, key, limited: count >= limit };
}

async function recordRateEvent(db: Awaited<ReturnType<typeof getDb>>, key: string, windowMs: number) {
  const now = new Date();
  await db.collection(AUTH_RATE_COLLECTION).insertOne({
    key,
    createdAt: now,
    expiresAt: new Date(now.getTime() + windowMs),
  });
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, salt, expectedHex] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !expectedHex || !validPasswordLength(password)) return false;
  const actual = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(expectedHex, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function setSession(userId: string) {
  await ensureAccountIndexes();
  const db = await getDb();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.collection("sessions").insertOne({ tokenHash: tokenHash(token), userId, createdAt: new Date().toISOString(), expiresAt });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function registerUser(input: { name: string; email: string; password: string }) {
  if (!hasDatabase()) return { ok: false as const, error: "MongoDB must be configured before accounts can be created." };
  const name = input.name.trim();
  const email = normalizeEmail(input.email);
  if (name.length < 2 || name.length > MAX_NAME_LENGTH) return { ok: false as const, error: "Enter a name between 2 and 100 characters." };
  if (!validEmail(email)) return { ok: false as const, error: "Enter a valid email address." };
  if (!validPasswordLength(input.password)) return { ok: false as const, error: `Use between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters for your password.` };

  const rate = await rateState("register", "account-creation", REGISTER_RATE_LIMIT, REGISTER_RATE_WINDOW_MS);
  if (rate.limited) return { ok: false as const, error: "Too many account creation attempts. Try again later." };
  await recordRateEvent(rate.db, rate.key, REGISTER_RATE_WINDOW_MS);

  const db = rate.db;
  const now = new Date().toISOString();
  try {
    const result = await db.collection("users").insertOne({
      name,
      email,
      passwordHash: await hashPassword(input.password),
      role: "user",
      status: "active",
      createdAt: now,
      updatedAt: now,
    });
    await setSession(result.insertedId.toString());
    return { ok: true as const };
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) return { ok: false as const, error: "An account already exists for that email." };
    throw error;
  }
}

async function maybeBootstrapAdmin(email: string, password: string) {
  const configuredPassword = process.env.ADMIN_PASSWORD;
  const configuredEmail = normalizeEmail(process.env.ADMIN_EMAIL || "");
  if (!configuredPassword || !validEmail(configuredEmail) || !validPasswordLength(configuredPassword)) return null;
  if (email !== configuredEmail || !secretsEqual(password, configuredPassword)) return null;

  await ensureAccountIndexes();
  const db = await getDb();
  const existingAdmin = await db.collection("users").findOne({ role: "admin" });
  if (existingAdmin) return null;
  const now = new Date().toISOString();
  const existingUser = await db.collection("users").findOne({ email: configuredEmail });
  if (existingUser) {
    await db.collection("users").updateOne(
      { _id: existingUser._id },
      { $set: { role: "admin", status: "active", passwordHash: await hashPassword(configuredPassword), updatedAt: now } },
    );
    return db.collection("users").findOne({ _id: existingUser._id });
  }

  try {
    const result = await db.collection("users").insertOne({
      name: "RapidReach Admin",
      email: configuredEmail,
      passwordHash: await hashPassword(configuredPassword),
      role: "admin",
      status: "active",
      createdAt: now,
      updatedAt: now,
    });
    return db.collection("users").findOne({ _id: result.insertedId });
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      return db.collection("users").findOne({ email: configuredEmail, role: "admin" });
    }
    throw error;
  }
}

export async function loginUser(input: { email: string; password: string; requireRole?: UserRole }) {
  if (!hasDatabase()) return { ok: false as const, error: "MongoDB must be configured before signing in." };
  const email = normalizeEmail(input.email);
  if (!validEmail(email) || !validPasswordLength(input.password)) return { ok: false as const, error: "Email or password is incorrect." };

  const rate = await rateState("login", email, LOGIN_RATE_LIMIT, LOGIN_RATE_WINDOW_MS);
  if (rate.limited) return { ok: false as const, error: "Too many sign-in attempts. Try again in a few minutes." };

  const db = rate.db;
  let doc = await db.collection("users").findOne({ email });
  if (!doc || (input.requireRole === "admin" && doc.role !== "admin")) {
    const bootstrapped = await maybeBootstrapAdmin(email, input.password);
    if (bootstrapped) doc = bootstrapped;
  }

  if (!doc || !(await verifyPassword(input.password, String(doc.passwordHash || "")))) {
    await recordRateEvent(db, rate.key, LOGIN_RATE_WINDOW_MS);
    return { ok: false as const, error: "Email or password is incorrect." };
  }
  if (doc.status === "disabled") {
    await recordRateEvent(db, rate.key, LOGIN_RATE_WINDOW_MS);
    return { ok: false as const, error: "This account has been disabled." };
  }
  const user = publicUser(doc as unknown as Record<string, unknown>);
  if (input.requireRole && user.role !== input.requireRole) {
    await recordRateEvent(db, rate.key, LOGIN_RATE_WINDOW_MS);
    return { ok: false as const, error: "This account does not have admin access." };
  }

  await db.collection(AUTH_RATE_COLLECTION).deleteMany({ key: rate.key });
  await setSession(user.id);
  return { ok: true as const, user };
}

export async function getCurrentUser(): Promise<User | null> {
  if (!hasDatabase()) return null;
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const db = await getDb();
    const session = await db.collection("sessions").findOne({ tokenHash: tokenHash(token), expiresAt: { $gt: new Date() } });
    if (!session?.userId || !ObjectId.isValid(String(session.userId))) return null;
    const user = await db.collection("users").findOne({ _id: new ObjectId(String(session.userId)), status: { $ne: "disabled" } });
    return user ? publicUser(user as unknown as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export async function logoutUser() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token && hasDatabase()) {
    try {
      const db = await getDb();
      await db.collection("sessions").deleteOne({ tokenHash: tokenHash(token) });
    } catch {}
  }
  store.delete(SESSION_COOKIE);
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdminUser() {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/dashboard");
  return user;
}
