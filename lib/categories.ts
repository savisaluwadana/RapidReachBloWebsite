import { getDb, hasDatabase } from "@/lib/mongodb";
import type { Category, CategoryKind } from "@/lib/types";

const fallback: Category[] = [
  { slug: "ai", name: "AI", kind: "post", description: "AI engineering, coding agents, models, and developer workflows.", createdAt: "2026-09-09T00:00:00.000Z" },
  { slug: "cloud", name: "Cloud", kind: "post", description: "Cloud native, platform engineering, infrastructure, and operations.", createdAt: "2026-09-09T00:00:00.000Z" },
  { slug: "devtools", name: "DevTools", kind: "post", description: "Developer tools, IDEs, APIs, frameworks, and engineering workflows.", createdAt: "2026-09-09T00:00:00.000Z" },
  { slug: "ai-devtools", name: "AI DevTools", kind: "tool", description: "AI-native products for software builders.", createdAt: "2026-09-09T00:00:00.000Z" },
  { slug: "platform-engineering", name: "Platform Engineering", kind: "tool", description: "Internal developer platforms, portals, and platform tooling.", createdAt: "2026-09-09T00:00:00.000Z" },
  { slug: "observability", name: "Observability", kind: "tool", description: "Logs, metrics, traces, profiling, and reliability tools.", createdAt: "2026-09-09T00:00:00.000Z" },
  { slug: "cicd", name: "CI/CD", kind: "tool", description: "Build, test, release, and deployment tooling.", createdAt: "2026-09-09T00:00:00.000Z" },
];

function normalize(doc: Record<string, unknown>): Category {
  return { slug: String(doc.slug), name: String(doc.name), kind: doc.kind === "tool" ? "tool" : "post", description: doc.description ? String(doc.description) : undefined, createdAt: String(doc.createdAt || new Date().toISOString()) };
}

export async function getCategoriesByKind(kind: CategoryKind) {
  if (!hasDatabase()) return fallback.filter((category) => category.kind === kind);
  const db = await getDb();
  const docs = await db.collection("categories").find({ kind }).sort({ name: 1 }).toArray();
  return docs.map((doc) => normalize(doc as unknown as Record<string, unknown>));
}

export async function getCategory(kind: CategoryKind, slug: string) {
  const categories = await getCategoriesByKind(kind);
  return categories.find((category) => category.slug === slug) || null;
}
