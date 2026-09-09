import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "rapidreach_admin";

function tokenFor(password: string) {
  return createHash("sha256").update(`rapidreach-admin:${password}`).digest("hex");
}

function configuredToken() {
  const password = process.env.ADMIN_PASSWORD;
  return password ? tokenFor(password) : null;
}

export function adminIsConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export async function isAdmin() {
  const expected = configuredToken();
  if (!expected) return false;
  const cookieStore = await cookies();
  const actual = cookieStore.get(COOKIE_NAME)?.value;
  if (!actual || actual.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}

export async function setAdminSession(password: string) {
  const expected = configuredToken();
  const submitted = tokenFor(password);
  if (!expected || submitted.length !== expected.length || !timingSafeEqual(Buffer.from(submitted), Buffer.from(expected))) return false;
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, expected, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 60 * 60 * 12 });
  return true;
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
