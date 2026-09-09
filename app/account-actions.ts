"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { loginUser, logoutUser, registerUser, requireUser } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { canUserEditSubmission } from "@/lib/submissions";

function text(form: FormData, key: string) {
  return String(form.get(key) || "").trim();
}

function list(form: FormData, key: string) {
  return text(form, key).split(",").map((item) => item.trim()).filter(Boolean);
}

function safeNext(value: string) {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
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
  const name = text(form, "name");
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
  const name = text(form, "name");
  const tagline = text(form, "tagline");
  const description = text(form, "description");
  const website = text(form, "website");
  const category = text(form, "category");
  if (!name || !tagline || !description || !website || !category) throw new Error("Complete the required submission fields.");

  const now = new Date().toISOString();
  const payload = {
    userId: user.id,
    name,
    tagline,
    description,
    website,
    github: text(form, "github") || undefined,
    logoUrl: text(form, "logoUrl") || undefined,
    screenshots: list(form, "screenshots").slice(0, 8),
    category,
    pricing: ["free", "freemium", "paid", "open-source"].includes(text(form, "pricing")) ? text(form, "pricing") : "free",
    openSource: form.get("openSource") === "on",
    maker: text(form, "maker") || undefined,
    tags: list(form, "tags"),
    reason: text(form, "reason") || undefined,
    updatedAt: now,
  };

  if (id && ObjectId.isValid(id)) {
    const existing = await db.collection("tool_submissions").findOne({ _id: new ObjectId(id), userId: user.id });
    if (!existing || !canUserEditSubmission(existing.status as never)) throw new Error("This submission can no longer be edited.");
    await db.collection("tool_submissions").updateOne(
      { _id: new ObjectId(id), userId: user.id },
      { $set: { ...payload, status: "pending", adminNotes: undefined } },
    );
  } else {
    await db.collection("tool_submissions").insertOne({ ...payload, status: "pending", submittedAt: now });
  }

  revalidatePath("/dashboard");
  redirect("/dashboard?submitted=1");
}
