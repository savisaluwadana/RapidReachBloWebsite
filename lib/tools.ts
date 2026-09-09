import { getDb, hasDatabase } from "@/lib/mongodb";
import type { Tool } from "@/lib/types";

export const starterTools: Tool[] = [
  {
    slug: "openchoreo",
    name: "OpenChoreo",
    tagline: "Open-source platform engineering for building, deploying, and operating applications.",
    description: "OpenChoreo provides platform abstractions, developer experience, deployment workflows, and observability on top of Kubernetes. It is designed for teams that want a composable internal developer platform rather than a monolithic developer portal.",
    website: "https://openchoreo.dev",
    github: "https://github.com/openchoreo/openchoreo",
    maker: "OpenChoreo Community",
    pricing: "open-source",
    openSource: true,
    category: "platform-engineering",
    tags: ["kubernetes", "platform engineering", "backstage", "open source"],
    featured: true,
    status: "published",
    launchedAt: "2026-01-01T00:00:00.000Z",
    screenshots: [],
    upvotes: 0,
    bestFor: ["Platform teams building a composable internal developer platform", "Kubernetes-based organizations that want strong platform APIs"],
    notIdealFor: ["Teams looking only for a hosted developer portal with no platform control plane"],
    strengths: ["Open source", "Platform abstractions and control plane", "Backstage integration", "Built for both humans and agents"],
    tradeoffs: ["Requires platform engineering ownership", "Best fit for Kubernetes-centric environments"],
    verdict: "A strong fit when you want Backstage-style developer experience backed by an actual platform control plane instead of portal-only glue.",
    alternatives: ["github-actions"],
    launchBoard: true,
    launchNote: "Worth watching for teams standardizing platform workflows around Kubernetes.",
  },
  {
    slug: "opentelemetry",
    name: "OpenTelemetry",
    tagline: "Vendor-neutral observability instrumentation and telemetry standards.",
    description: "OpenTelemetry gives developers a common way to generate, collect, and export traces, metrics, and logs across distributed systems. It has become a foundational layer in modern observability stacks.",
    website: "https://opentelemetry.io",
    github: "https://github.com/open-telemetry",
    maker: "OpenTelemetry Community",
    pricing: "open-source",
    openSource: true,
    category: "observability",
    tags: ["observability", "tracing", "metrics", "logs"],
    featured: true,
    status: "published",
    launchedAt: "2026-01-02T00:00:00.000Z",
    screenshots: [],
    upvotes: 0,
    bestFor: ["Teams that want vendor-neutral telemetry", "Distributed systems with multiple observability backends"],
    strengths: ["Vendor neutral", "Broad ecosystem support", "Open standard"],
    tradeoffs: ["Instrumentation strategy still needs engineering ownership"],
    verdict: "A foundational observability primitive rather than a dashboard product. Most modern telemetry stacks should evaluate it early.",
    launchBoard: true,
    launchNote: "The neutral instrumentation layer behind a growing share of modern observability stacks.",
  },
  {
    slug: "github-actions",
    name: "GitHub Actions",
    tagline: "Automate software workflows directly from GitHub repositories.",
    description: "GitHub Actions provides hosted and self-hosted workflow automation for CI, delivery, testing, releases, and repository operations using versioned workflow files.",
    website: "https://github.com/features/actions",
    maker: "GitHub",
    pricing: "freemium",
    openSource: false,
    category: "cicd",
    tags: ["ci/cd", "automation", "github"],
    featured: false,
    status: "published",
    launchedAt: "2026-01-03T00:00:00.000Z",
    screenshots: [],
    upvotes: 0,
    bestFor: ["Teams already centered on GitHub", "Repository-native CI and automation"],
    strengths: ["Deep GitHub integration", "Large actions ecosystem", "Hosted and self-hosted runners"],
    tradeoffs: ["Tighter coupling to GitHub than independent CI systems"],
    verdict: "The default automation choice for many GitHub-centric teams because workflow context lives beside the code.",
  },
];

function strings(value: unknown, limit = 20) {
  return Array.isArray(value) ? value.map(String).map((item) => item.trim()).filter(Boolean).slice(0, limit) : [];
}

function normalize(doc: Record<string, unknown>): Tool {
  return {
    slug: String(doc.slug),
    name: String(doc.name),
    tagline: String(doc.tagline || ""),
    description: String(doc.description || ""),
    website: String(doc.website || ""),
    github: doc.github ? String(doc.github) : undefined,
    logoUrl: doc.logoUrl ? String(doc.logoUrl) : undefined,
    screenshots: strings(doc.screenshots, 8),
    maker: doc.maker ? String(doc.maker) : undefined,
    pricing: ["free", "freemium", "paid", "open-source"].includes(String(doc.pricing)) ? doc.pricing as Tool["pricing"] : "free",
    openSource: Boolean(doc.openSource),
    category: String(doc.category || "developer-tools"),
    tags: strings(doc.tags, 20),
    featured: Boolean(doc.featured),
    status: doc.status === "draft" ? "draft" : "published",
    launchedAt: String(doc.launchedAt || new Date().toISOString()),
    updatedAt: doc.updatedAt ? String(doc.updatedAt) : undefined,
    upvotes: Number(doc.upvotes || 0),
    bestFor: strings(doc.bestFor, 12),
    notIdealFor: strings(doc.notIdealFor, 12),
    strengths: strings(doc.strengths, 12),
    tradeoffs: strings(doc.tradeoffs, 12),
    verdict: doc.verdict ? String(doc.verdict) : undefined,
    alternatives: strings(doc.alternatives, 8),
    relatedPostSlugs: strings(doc.relatedPostSlugs, 12),
    launchBoard: Boolean(doc.launchBoard),
    launchNote: doc.launchNote ? String(doc.launchNote) : undefined,
  };
}

function fallback(options?: { category?: string; featured?: boolean; includeDrafts?: boolean; launchBoard?: boolean }) {
  return starterTools.filter((tool) =>
    (!options?.category || tool.category === options.category) &&
    (options?.featured === undefined || tool.featured === options.featured) &&
    (options?.launchBoard === undefined || Boolean(tool.launchBoard) === options.launchBoard)
  );
}

export async function getTools(options?: { category?: string; featured?: boolean; includeDrafts?: boolean; launchBoard?: boolean }) {
  if (!hasDatabase()) return fallback(options);
  try {
    const db = await getDb();
    const query: Record<string, unknown> = options?.includeDrafts ? {} : { status: "published" };
    if (options?.category) query.category = options.category;
    if (options?.featured !== undefined) query.featured = options.featured;
    if (options?.launchBoard !== undefined) query.launchBoard = options.launchBoard;
    const docs = await db.collection("tools").find(query).sort({ featured: -1, launchedAt: -1 }).toArray();
    return docs.map((doc) => normalize(doc as unknown as Record<string, unknown>));
  } catch {
    return fallback(options);
  }
}

export async function getToolBySlug(slug: string, includeDrafts = false) {
  if (!hasDatabase()) return starterTools.find((tool) => tool.slug === slug) || null;
  try {
    const db = await getDb();
    const doc = await db.collection("tools").findOne(includeDrafts ? { slug } : { slug, status: "published" });
    return doc ? normalize(doc as unknown as Record<string, unknown>) : null;
  } catch {
    return starterTools.find((tool) => tool.slug === slug) || null;
  }
}
