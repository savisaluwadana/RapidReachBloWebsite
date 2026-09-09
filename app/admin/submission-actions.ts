"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { getDb } from "@/lib/mongodb";

function text(form: FormData, key: string) {
  return String(form.get(key) || "").trim();
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "tool";
}

export async function reviewSubmission(form: FormData) {
  const admin = await requireAdmin();
  const id = text(form, "id");
  const requested = text(form, "status");
  const allowed = new Set(["in_review", "changes_requested", "rejected"]);
  if (!ObjectId.isValid(id) || !allowed.has(requested)) throw new Error("Invalid review action.");
  const db = await getDb();
  const now = new Date().toISOString();
  await db.collection("tool_submissions").updateOne(
    { _id: new ObjectId(id), status: { $ne: "approved" } },
    { $set: { status: requested, adminNotes: text(form, "adminNotes") || undefined, reviewedAt: now, reviewedBy: admin.id, updatedAt: now } },
  );
  revalidatePath("/admin/submissions");
  revalidatePath(`/admin/submissions/${id}`);
  redirect("/admin/submissions");
}

export async function approveSubmission(form: FormData) {
  const admin = await requireAdmin();
  const id = text(form, "id");
  if (!ObjectId.isValid(id)) throw new Error("Invalid submission.");
  const db = await getDb();
  const submission = await db.collection("tool_submissions").findOne({ _id: new ObjectId(id) });
  if (!submission) throw new Error("Submission not found.");
  if (submission.status === "approved" && submission.convertedToolSlug) redirect(`/admin/tools/${submission.convertedToolSlug}/edit`);

  let slug = slugify(String(submission.name || "tool"));
  if (await db.collection("tools").findOne({ slug })) slug = `${slug}-${id.slice(-6).toLowerCase()}`;
  const now = new Date().toISOString();
  await db.collection("tools").insertOne({
    slug,
    name: String(submission.name || ""),
    tagline: String(submission.tagline || ""),
    description: String(submission.description || ""),
    website: String(submission.website || ""),
    github: submission.github || undefined,
    logoUrl: submission.logoUrl || undefined,
    screenshots: Array.isArray(submission.screenshots) ? submission.screenshots : [],
    maker: submission.maker || undefined,
    pricing: submission.pricing || "free",
    openSource: Boolean(submission.openSource),
    category: String(submission.category || ""),
    tags: Array.isArray(submission.tags) ? submission.tags : [],
    featured: false,
    status: "draft",
    launchedAt: now,
    updatedAt: now,
    upvotes: 0,
    sourceSubmissionId: id,
  });
  await db.collection("tool_submissions").updateOne(
    { _id: new ObjectId(id) },
    { $set: { status: "approved", adminNotes: text(form, "adminNotes") || undefined, reviewedAt: now, reviewedBy: admin.id, convertedToolSlug: slug, updatedAt: now } },
  );
  revalidatePath("/admin");
  revalidatePath("/admin/submissions");
  revalidatePath("/admin/tools");
  redirect(`/admin/tools/${slug}/edit`);
}

export async function updateUserAccount(form: FormData) {
  const admin = await requireAdmin();
  const id = text(form, "id");
  if (!ObjectId.isValid(id)) throw new Error("Invalid user.");
  const role = text(form, "role") === "admin" ? "admin" : "user";
  const status = text(form, "status") === "disabled" ? "disabled" : "active";
  if (admin.id === id && (role !== "admin" || status !== "active")) throw new Error("You cannot remove your own admin access or disable your own account.");
  const db = await getDb();
  await db.collection("users").updateOne({ _id: new ObjectId(id) }, { $set: { role, status, updatedAt: new Date().toISOString() } });
  if (status === "disabled") await db.collection("sessions").deleteMany({ userId: id });
  revalidatePath("/admin/users");
}
