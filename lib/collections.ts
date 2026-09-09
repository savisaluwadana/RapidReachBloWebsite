import { getDb, hasDatabase } from "@/lib/mongodb";
import type { EditorialCollection } from "@/lib/types";

export const starterCollections: EditorialCollection[] = [
  {
    slug: "platform-engineering-starter-stack",
    title: "Platform Engineering Starter Stack",
    description: "A compact starting point for teams connecting developer experience, delivery automation, and observability without buying into one monolith.",
    toolSlugs: ["openchoreo", "opentelemetry", "github-actions"],
    postSlugs: ["why-developer-portals-are-moving-closer-to-the-workflow", "the-new-default-for-developer-tools-is-composable"],
    featured: true,
    status: "published",
    createdAt: "2026-09-09T00:00:00.000Z",
  },
];

function normalize(doc: Record<string, unknown>): EditorialCollection {
  return {
    slug: String(doc.slug),
    title: String(doc.title || ""),
    description: String(doc.description || ""),
    toolSlugs: Array.isArray(doc.toolSlugs) ? doc.toolSlugs.map(String) : [],
    postSlugs: Array.isArray(doc.postSlugs) ? doc.postSlugs.map(String) : [],
    featured: Boolean(doc.featured),
    status: doc.status === "draft" ? "draft" : "published",
    createdAt: String(doc.createdAt || new Date().toISOString()),
    updatedAt: doc.updatedAt ? String(doc.updatedAt) : undefined,
  };
}

export async function getCollections(includeDrafts = false) {
  if (!hasDatabase()) return starterCollections;
  try {
    const db = await getDb();
    const docs = await db.collection("collections").find(includeDrafts ? {} : { status: "published" }).sort({ featured: -1, updatedAt: -1, createdAt: -1 }).toArray();
    return docs.map((doc) => normalize(doc as unknown as Record<string, unknown>));
  } catch {
    return starterCollections;
  }
}

export async function getCollectionBySlug(slug: string, includeDrafts = false) {
  if (!hasDatabase()) return starterCollections.find((item) => item.slug === slug) || null;
  try {
    const db = await getDb();
    const doc = await db.collection("collections").findOne(includeDrafts ? { slug } : { slug, status: "published" });
    return doc ? normalize(doc as unknown as Record<string, unknown>) : null;
  } catch {
    return starterCollections.find((item) => item.slug === slug) || null;
  }
}
