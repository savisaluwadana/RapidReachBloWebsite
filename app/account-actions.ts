"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { loginUser, logoutUser, registerUser, requireUser } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { canUserEditSubmission } from "@/lib/submissions";
import type { ToolSubmissionStatus } from "@/lib/types";

function text(form: FormData, key: string) {
  return String(form.get(key) || "").trim();
}

function list(form: FormData, key: string) {
  return text(form, key).split(",").map((item) => item.trim()).filter(Boolean);
}

function safeNext(value: string) {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

function validHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function registerAccount(form: FormData) {
  const result = await registerUser({ name: text(form, "name"), email: text(form, "email"), password: text(form, "password") });
  if (!result.ok) redirect(`/register?error=${encodeURIComponent(result.error)}`);
  redirect("/dashboard");
}

export async function loginAccount(form: FormData) {
  const next = safeNext(text(form, "next") || "/dashboard");
  const result = await loginUser({ email: text(form, "email"), password: text(form, "password") });
  if (!result.ok) redirect(`/login?error=${encodeURIComponent(result.error)}&next=${encodeURIComponent(next)}`);
  redirect(result.user.role === "admin" && next === "/dashboard" ? "/admin" : next);
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
  const category = text(form, "category");
  if (!name || !tagline || !description || !website || !category) throw new Error("Complete the required submission fields.");
  if (!validHttpUrl(website) || (github && !validHttpUrl(github))) throw new Error("Use valid http/https URLs for the website and GitHub fields.");
  if (!(await db.collection("categories").findOne({ slug: category, kind: "tool" }))) throw new Error("Choose a valid tool category.");

  const now = new Date().toISOString();
  const payload = {
    userId: user.id,
    name,
    tagline,
    description,
    website,
    github: github || undefined,
    logoUrl: text(form, "logoUrl") || undefined,
    screenshots: list(form, "screenshots").slice(0, 8),
    category,
    pricing: ["free", "freemium", "paid", "open-source"].includes(text(form, "pricing")) ? text(form, "pricing") : "free",
    openSource: form.get("openSource") === "on",
    maker: text(form, "maker").slice(0, 160) || undefined,
    tags: list(form, "tags").slice(0, 12),
    reason: text(form, "reason").slice(0, 2000) || undefined,
    updatedAt: now,
  };

  if (id && ObjectId.isValid(id)) {
    const existing = await db.collection("tool_submissions").findOne({ _id: new ObjectId(id), userId: user.id });
    if (!existing || !canUserEditSubmission(String(existing.status) as ToolSubmissionStatus)) throw new Error("This submission can no longer be edited.");
    await db.collection("tool_submissions").updateOne(
      { _id: new ObjectId(id), userId: user.id },
      { $set: { ...payload, status: "pending" }, $unset: { adminNotes: "", reviewedAt: "", reviewedBy: "" } },
    );
  } else {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const recentCount = await db.collection("tool_submissions").countDocuments({ userId: user.id, submittedAt: { $gte: since } });
    if (recentCount >= 10) throw new Error("You have reached the daily submission limit. Try again later.");
    await db.collection("tool_submissions").insertOne({ ...payload, status: "pending", submittedAt: now });
  }

  revalidatePath("/dashboard");
  redirect("/dashboard?submitted=1");
}
