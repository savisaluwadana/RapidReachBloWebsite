"use server";

import { MongoServerError, ObjectId } from "mongodb";
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
  const result = await db.collection("tool_submissions").updateOne(
    { _id: new ObjectId(id), status: { $ne: "approved" } },
    { $set: { status: requested, adminNotes: text(form, "adminNotes") || undefined, reviewedAt: now, reviewedBy: admin.id, updatedAt: now } },
  );
  if (!result.matchedCount) throw new Error("This submission has already been approved or no longer exists.");
  revalidatePath("/admin/submissions");
  revalidatePath(`/admin/submissions/${id}`);
  redirect("/admin/submissions");
}

export async function approveSubmission(form: FormData) {
  const admin = await requireAdmin();
  const id = text(form, "id");
  if (!ObjectId.isValid(id)) throw new Error("Invalid submission.");

  const db = await getDb();
  const tools = db.collection("tools");
  const submissions = db.collection("tool_submissions");

  // A unique sparse source ID makes approval idempotent even when two admins
  // submit the approval action at nearly the same time.
  await tools.createIndex({ sourceSubmissionId: 1 }, { unique: true, sparse: true });

  const submission = await submissions.findOne({ _id: new ObjectId(id) });
  if (!submission) throw new Error("Submission not found.");

  const existingConvertedTool = await tools.findOne({ sourceSubmissionId: id });
  if (existingConvertedTool?.slug) {
    const convertedSlug = String(existingConvertedTool.slug);
    if (submission.status !== "approved" || submission.convertedToolSlug !== convertedSlug) {
      const now = new Date().toISOString();
      await submissions.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: "approved", adminNotes: text(form, "adminNotes") || undefined, reviewedAt: now, reviewedBy: admin.id, convertedToolSlug: convertedSlug, updatedAt: now } },
      );
    }
    redirect(`/admin/tools/${convertedSlug}/edit`);
  }

  if (submission.status === "approved" && submission.convertedToolSlug) {
    redirect(`/admin/tools/${submission.convertedToolSlug}/edit`);
  }

  const baseSlug = slugify(String(submission.name || "tool"));
  const now = new Date().toISOString();
  const toolDocument = {
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
  };

  let slug = baseSlug;
  if (await tools.findOne({ slug })) slug = `${baseSlug}-${id.slice(-6).toLowerCase()}`;

  try {
    await tools.updateOne(
      { sourceSubmissionId: id },
      { $setOnInsert: { ...toolDocument, slug } },
      { upsert: true },
    );
  } catch (error) {
    // A different submission with the same name can win the base-slug race.
    // Retry with a deterministic submission-specific slug while retaining the
    // sourceSubmissionId upsert guard.
    if (!(error instanceof MongoServerError) || error.code !== 11000) throw error;
    slug = `${baseSlug}-${id.slice(-6).toLowerCase()}`;
    await tools.updateOne(
      { sourceSubmissionId: id },
      { $setOnInsert: { ...toolDocument, slug } },
      { upsert: true },
    );
  }

  const convertedTool = await tools.findOne({ sourceSubmissionId: id }, { projection: { slug: 1 } });
  if (!convertedTool?.slug) throw new Error("Could not convert the approved submission into a tool.");
  const convertedSlug = String(convertedTool.slug);

  await submissions.updateOne(
    { _id: new ObjectId(id) },
    { $set: { status: "approved", adminNotes: text(form, "adminNotes") || undefined, reviewedAt: now, reviewedBy: admin.id, convertedToolSlug: convertedSlug, updatedAt: now } },
  );

  revalidatePath("/admin");
  revalidatePath("/admin/submissions");
  revalidatePath("/admin/tools");
  redirect(`/admin/tools/${convertedSlug}/edit`);
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
