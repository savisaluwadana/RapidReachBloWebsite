import { ObjectId } from "mongodb";
import { getDb, hasDatabase } from "@/lib/mongodb";
import type { ToolSubmission, ToolSubmissionStatus } from "@/lib/types";

function normalize(doc: Record<string, unknown>): ToolSubmission {
  return {
    id: String(doc._id),
    userId: String(doc.userId || ""),
    name: String(doc.name || ""),
    tagline: String(doc.tagline || ""),
    description: String(doc.description || ""),
    website: String(doc.website || ""),
    github: doc.github ? String(doc.github) : undefined,
    logoUrl: doc.logoUrl ? String(doc.logoUrl) : undefined,
    screenshots: Array.isArray(doc.screenshots) ? doc.screenshots.map(String) : [],
    category: String(doc.category || ""),
    pricing: ["free", "freemium", "paid", "open-source"].includes(String(doc.pricing)) ? doc.pricing as ToolSubmission["pricing"] : "free",
    openSource: Boolean(doc.openSource),
    maker: doc.maker ? String(doc.maker) : undefined,
    tags: Array.isArray(doc.tags) ? doc.tags.map(String) : [],
    reason: doc.reason ? String(doc.reason) : undefined,
    status: ["pending", "in_review", "changes_requested", "approved", "rejected"].includes(String(doc.status)) ? doc.status as ToolSubmissionStatus : "pending",
    adminNotes: doc.adminNotes ? String(doc.adminNotes) : undefined,
    submittedAt: String(doc.submittedAt || new Date().toISOString()),
    updatedAt: String(doc.updatedAt || doc.submittedAt || new Date().toISOString()),
    reviewedAt: doc.reviewedAt ? String(doc.reviewedAt) : undefined,
    reviewedBy: doc.reviewedBy ? String(doc.reviewedBy) : undefined,
    convertedToolSlug: doc.convertedToolSlug ? String(doc.convertedToolSlug) : undefined,
  };
}

export async function getUserSubmissions(userId: string) {
  if (!hasDatabase()) return [];
  const db = await getDb();
  const docs = await db.collection("tool_submissions").find({ userId }).sort({ updatedAt: -1 }).toArray();
  return docs.map((doc) => normalize(doc as unknown as Record<string, unknown>));
}

export async function getUserSubmission(userId: string, id: string) {
  if (!hasDatabase() || !ObjectId.isValid(id)) return null;
  const db = await getDb();
  const doc = await db.collection("tool_submissions").findOne({ _id: new ObjectId(id), userId });
  return doc ? normalize(doc as unknown as Record<string, unknown>) : null;
}

export async function getAllSubmissions(status?: ToolSubmissionStatus) {
  if (!hasDatabase()) return [];
  const db = await getDb();
  const query = status ? { status } : {};
  const docs = await db.collection("tool_submissions").find(query).sort({ updatedAt: -1 }).toArray();
  return docs.map((doc) => normalize(doc as unknown as Record<string, unknown>));
}

export async function getSubmissionById(id: string) {
  if (!hasDatabase() || !ObjectId.isValid(id)) return null;
  const db = await getDb();
  const doc = await db.collection("tool_submissions").findOne({ _id: new ObjectId(id) });
  return doc ? normalize(doc as unknown as Record<string, unknown>) : null;
}

export function canUserEditSubmission(status: ToolSubmissionStatus) {
  return status === "pending" || status === "changes_requested";
}
