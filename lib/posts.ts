import { getCategoriesByKind } from "@/lib/categories";
import { getDb, hasDatabase } from "@/lib/mongodb";
import type { Post } from "@/lib/types";

export const starterPosts: Post[] = [
  {
    slug: "the-new-default-for-developer-tools-is-composable",
    title: "The new default for developer tools is composable",
    summary: "Developer tooling is shifting from all-in-one platforms toward smaller primitives that can be assembled around a team’s existing workflow.",
    content: "The best developer tools increasingly behave like building blocks rather than destinations. Teams want APIs, events, automation hooks, and portable data before they want another dashboard.\n\nThat changes how products should be evaluated. The question is no longer only whether a tool has the right feature. It is whether the feature can be composed into the delivery system a team already trusts.\n\nThis favors products that expose clear interfaces, keep ownership boundaries visible, and make migration boring. A polished UI still matters, but the durable advantage is interoperability.",
    category: "DevTools",
    author: "RapidReach Editorial",
    publishedAt: "2026-09-08T08:00:00.000Z",
    readingMinutes: 4,
    tags: ["developer tools", "platform engineering", "apis"],
    keyTakeaways: ["APIs and events are becoming product features, not integrations added later.", "Interoperability can matter more than the size of a feature list.", "The strongest tools fit existing workflows instead of forcing a total replacement."],
    likes: 0,
    status: "published"
  },
  {
    slug: "why-developer-portals-are-moving-closer-to-the-workflow",
    title: "Why developer portals are moving closer to the workflow",
    summary: "The useful developer portal is becoming less of a catalog and more of a context layer that connects code, environments, ownership, and delivery actions.",
    content: "A software catalog is useful, but it is rarely the end state. Developers care about the next action: understand an owner, inspect a deployment, trace a failure, request an environment, or ship a change.\n\nThat is why portal design is moving toward workflow context. The portal becomes a place where information from different systems is made understandable without pretending those systems no longer exist.\n\nThe practical design rule is simple: keep the portal thin, keep platform APIs explicit, and avoid burying operational ownership in custom UI glue.",
    category: "Cloud",
    author: "RapidReach Editorial",
    publishedAt: "2026-09-07T08:00:00.000Z",
    readingMinutes: 5,
    tags: ["backstage", "developer portals", "cloud native"],
    keyTakeaways: ["Catalogs are most valuable when they lead directly to useful actions.", "A portal should expose platform context without becoming the platform itself.", "Thin experience layers are easier to evolve than deeply coupled portals."],
    likes: 0,
    status: "published"
  },
  {
    slug: "ai-coding-tools-need-better-context-not-more-prompts",
    title: "AI coding tools need better context, not more prompts",
    summary: "The next improvement in coding agents is likely to come from reliable repository, runtime, and platform context rather than larger prompt templates.",
    content: "Coding agents can already generate a large amount of code. The bottleneck is knowing what code is appropriate for a specific system.\n\nRepository conventions, service ownership, deployment constraints, observability signals, and internal APIs all change what a correct answer looks like. When that context is machine-readable, an agent can make fewer assumptions.\n\nFor engineering teams, this makes documentation architecture part of AI readiness. Structured metadata, stable APIs, searchable decision records, and explicit boundaries help humans and agents at the same time.",
    category: "AI",
    author: "RapidReach Editorial",
    publishedAt: "2026-09-06T08:00:00.000Z",
    readingMinutes: 4,
    tags: ["ai coding", "agents", "developer experience"],
    keyTakeaways: ["Agent quality depends heavily on trustworthy engineering context.", "Machine-readable documentation benefits both developers and coding agents.", "Repository and platform conventions should be explicit rather than tribal knowledge."],
    likes: 0,
    status: "published"
  }
];

function normalize(post: Record<string, unknown>): Post {
  return {
    slug: String(post.slug), title: String(post.title), summary: String(post.summary), content: String(post.content),
    category: String(post.category), author: String(post.author), publishedAt: String(post.publishedAt),
    updatedAt: post.updatedAt ? String(post.updatedAt) : undefined,
    featuredImageUrl: post.featuredImageUrl ? String(post.featuredImageUrl) : undefined,
    readingMinutes: Number(post.readingMinutes || 4),
    tags: Array.isArray(post.tags) ? post.tags.map(String) : [], keyTakeaways: Array.isArray(post.keyTakeaways) ? post.keyTakeaways.map(String) : [],
    likes: Number(post.likes || 0), status: post.status === "draft" ? "draft" : "published"
  };
}

export async function getPosts(): Promise<Post[]> {
  if (!hasDatabase()) return starterPosts;
  try {
    const db = await getDb();
    const docs = await db.collection("posts").find({ status: "published" }).sort({ publishedAt: -1 }).toArray();
    return docs.map((doc) => normalize(doc as unknown as Record<string, unknown>));
  } catch {
    return starterPosts;
  }
}

export async function getAdminPosts(): Promise<Post[]> {
  if (!hasDatabase()) return starterPosts;
  const db = await getDb();
  const docs = await db.collection("posts").find({}).sort({ updatedAt: -1, publishedAt: -1 }).toArray();
  return docs.map((doc) => normalize(doc as unknown as Record<string, unknown>));
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  if (!hasDatabase()) return starterPosts.find((post) => post.slug === slug) || null;
  try {
    const db = await getDb();
    const doc = await db.collection("posts").findOne({ slug, status: "published" });
    return doc ? normalize(doc as unknown as Record<string, unknown>) : null;
  } catch {
    return starterPosts.find((post) => post.slug === slug) || null;
  }
}

export async function getAdminPostBySlug(slug: string): Promise<Post | null> {
  if (!hasDatabase()) return starterPosts.find((post) => post.slug === slug) || null;
  const db = await getDb();
  const doc = await db.collection("posts").findOne({ slug });
  return doc ? normalize(doc as unknown as Record<string, unknown>) : null;
}

export async function getCategories() {
  const managed = await getCategoriesByKind("post");
  if (managed.length) return managed.map((category) => category.name);
  const posts = await getPosts();
  return [...new Set(posts.map((post) => post.category))].sort();
}
