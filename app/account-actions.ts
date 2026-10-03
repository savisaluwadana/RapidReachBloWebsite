"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { loginUser, logoutUser, registerUser, requireUser, verifyPassword } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { requestPasswordResetEmail, resetPasswordWithToken, sendVerificationEmail } from "@/lib/account-email";
import { markMediaAttached } from "@/lib/media";
import { userReactionActorHash } from "@/lib/reactions";

function text(form: FormData, key: string) {
  return String(form.get(key) || "").trim();
}

function raw(form: FormData, key: string) {
  return String(form.get(key) || "");
}

function list(form: FormData, key: string) {
  return text(form, key).split(",").map((item) => item.trim()).filter(Boolean);
}

function safeNext(value: string) {
  const fallback = "/dashboard";
  if (!value) return fallback;
  try {
    const origin = "https://rapidreach.invalid";
    const target = new URL(value, origin);
    if (target.origin !== origin) return fallback;
    return `${target.pathname}${target.search}${target.hash}` || fallback;
  } catch {
    return fallback;
  }
}

function validHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function validHttpsUrl(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export async function registerAccount(form: FormData) {
  const result = await registerUser({ name: text(form, "name"), email: text(form, "email"), password: raw(form, "password") });
  if (!result.ok) redirect(`/register?error=${encodeURIComponent(result.error)}`);
  const sent = await sendVerificationEmail(result.user.id, result.user.email);
  redirect(`/dashboard?verify=${sent ? "sent" : "unavailable"}`);
}

export async function resendVerificationEmail() {
  const user = await requireUser();
  if (user.emailVerified) redirect("/dashboard?verify=already");
  const sent = await sendVerificationEmail(user.id, user.email);
  redirect(`/dashboard?verify=${sent ? "sent" : "unavailable"}`);
}

export async function requestPasswordReset(form: FormData) {
  const email = text(form, "email").toLowerCase();
  const result = await requestPasswordResetEmail(email);
  if (!result.configured) redirect("/forgot-password?error=config");
  redirect("/forgot-password?sent=1");
}

export async function resetPasswordAccount(form: FormData) {
  const token = text(form, "token");
  const password = raw(form, "password");
  const confirm = raw(form, "confirmPassword");
  if (password !== confirm) redirect(`/reset-password?token=${encodeURIComponent(token)}&error=${encodeURIComponent("Passwords do not match.")}`);
  const result = await resetPasswordWithToken(token, password);
  if (!result.ok) redirect(`/reset-password?token=${encodeURIComponent(token)}&error=${encodeURIComponent(result.error)}`);
  redirect("/login?reset=1");
}

export async function loginAccount(form: FormData) {
  const next = safeNext(text(form, "next") || "/dashboard");
  const result = await loginUser({ email: text(form, "email"), password: raw(form, "password") });
  if (!result.ok) redirect(`/login?error=${encodeURIComponent(result.error)}&next=${encodeURIComponent(next)}`);
  redirect(result.user.role === "admin" && next === "/dashboard" ? "/admin" : next);
}

export async function loginAdminAccount(form: FormData) {
  const result = await loginUser({
    email: text(form, "email"),
    password: raw(form, "password"),
    requireRole: "admin",
  });
  if (!result.ok) redirect(`/admin/login?error=${encodeURIComponent(result.error)}`);
  redirect("/admin");
}

export async function logoutAccount() {
  await logoutUser();
  redirect("/");
}

export async function updateProfile(form: FormData) {
  const user = await requireUser();
  const name = text(form, "name").slice(0, 100);
  if (name.length < 2) redirect("/dashboard?profile=error");
  const db = await getDb();
  await db.collection("users").updateOne({ _id: new ObjectId(user.id) }, { $set: { name, updatedAt: new Date().toISOString() } });
  revalidatePath("/dashboard");
  redirect("/dashboard?profile=updated");
}

export async function saveToolSubmission(form: FormData) {
  const user = await requireUser();
  const db = await getDb();
  const id = text(form, "submissionId");
  const name = text(form, "name").slice(0, 120);
  const tagline = text(form, "tagline").slice(0, 240);
  const description = text(form, "description").slice(0, 8000);
  const website = text(form, "website");
  const github = text(form, "github");
  const logoUrl = text(form, "logoUrl");
  const screenshots = list(form, "screenshots").slice(0, 8);
  const category = text(form, "category");
  if (!name || !tagline || !description || !website || !category) throw new Error("Complete the required submission fields.");
  if (!validHttpUrl(website) || (github && !validHttpUrl(github))) throw new Error("Use valid http/https URLs for the website and GitHub fields.");
  if (logoUrl && !validHttpsUrl(logoUrl)) throw new Error("Tool logos must use HTTPS URLs.");
  if (screenshots.some((url) => !validHttpsUrl(url))) throw new Error("Screenshots must use HTTPS URLs.");
  if (!(await db.collection("categories").findOne({ slug: category, kind: "tool" }))) throw new Error("Choose a valid tool category.");

  const now = new Date().toISOString();
  const payload = {
    userId: user.id,
    name,
    tagline,
    description,
    website,
    github: github || undefined,
    logoUrl: logoUrl || undefined,
    screenshots,
    category,
    pricing: ["free", "freemium", "paid", "open-source"].includes(text(form, "pricing")) ? text(form, "pricing") : "free",
    openSource: form.get("openSource") === "on",
    maker: text(form, "maker").slice(0, 160) || undefined,
    tags: list(form, "tags").slice(0, 12),
    reason: text(form, "reason").slice(0, 2000) || undefined,
    updatedAt: now,
  };

  if (id) {
    if (!ObjectId.isValid(id)) throw new Error("Invalid submission identifier.");
    const result = await db.collection("tool_submissions").updateOne(
      { _id: new ObjectId(id), userId: user.id, status: { $in: ["pending", "changes_requested"] } },
      { $set: { ...payload, status: "pending" }, $unset: { adminNotes: "", reviewedAt: "", reviewedBy: "" } },
    );
    if (!result.matchedCount) throw new Error("This submission can no longer be edited.");
  } else {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const recentCount = await db.collection("tool_submissions").countDocuments({ userId: user.id, submittedAt: { $gte: since } });
    if (recentCount >= 10) throw new Error("You have reached the daily submission limit. Try again later.");
    await db.collection("tool_submissions").insertOne({ ...payload, status: "pending", submittedAt: now });
  }

  await markMediaAttached([logoUrl, ...screenshots], user.id);
  revalidatePath("/dashboard");
  redirect("/dashboard?submitted=1");
}

export async function deleteAccount(form: FormData) {
  const user = await requireUser();
  if (user.role === "admin") redirect("/dashboard?account=admin-protected");
  const password = raw(form, "password");
  const db = await getDb();
  const doc = await db.collection("users").findOne(
    { _id: new ObjectId(user.id) },
    { projection: { passwordHash: 1 } },
  );
  if (!doc || !(await verifyPassword(password, String(doc.passwordHash || "")))) {
    redirect("/dashboard?account=wrong-password");
  }

  await Promise.all([
    db.collection("sessions").deleteMany({ userId: user.id }),
    db.collection("user_preferences").deleteMany({ userId: user.id }),
    db.collection("comments").deleteMany({ userId: user.id }),
    db.collection("engagement_reactions").deleteMany({ actorHash: userReactionActorHash(user.id) }),
    db.collection("tool_submissions").deleteMany({ userId: user.id }),
    db.collection("account_tokens").deleteMany({ userId: user.id }),
    db.collection("newsletter_subscribers").deleteMany({ email: user.email }),
  ]);
  await db.collection("users").deleteOne({ _id: new ObjectId(user.id) });
  await logoutUser();
  redirect("/?account=deleted");
}
