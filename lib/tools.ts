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
    upvotes: 0,
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
    upvotes: 0,
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
    upvotes: 0,
  },
];

function normalize(doc: Record<string, unknown>): Tool {
  return {
    slug: String(doc.slug),
    name: String(doc.name),
    tagline: String(doc.tagline || ""),
    description: String(doc.description || ""),
    website: String(doc.website || ""),
    github: doc.github ? String(doc.github) : undefined,
    logoUrl: doc.logoUrl ? String(doc.logoUrl) : undefined,
    maker: doc.maker ? String(doc.maker) : undefined,
    pricing: ["free", "freemium", "paid", "open-source"].includes(String(doc.pricing)) ? doc.pricing as Tool["pricing"] : "free",
    openSource: Boolean(doc.openSource),
    category: String(doc.category || "developer-tools"),
    tags: Array.isArray(doc.tags) ? doc.tags.map(String) : [],
    featured: Boolean(doc.featured),
    status: doc.status === "draft" ? "draft" : "published",
    launchedAt: String(doc.launchedAt || new Date().toISOString()),
    updatedAt: doc.updatedAt ? String(doc.updatedAt) : undefined,
    upvotes: Number(doc.upvotes || 0),
  };
}

export async function getTools(options?: { category?: string; featured?: boolean; includeDrafts?: boolean }) {
  if (!hasDatabase()) {
    return starterTools.filter((tool) => (!options?.category || tool.category === options.category) && (options?.featured === undefined || tool.featured === options.featured));
  }
  try {
    const db = await getDb();
    const query: Record<string, unknown> = options?.includeDrafts ? {} : { status: "published" };
    if (options?.category) query.category = options.category;
    if (options?.featured !== undefined) query.featured = options.featured;
    const docs = await db.collection("tools").find(query).sort({ featured: -1, launchedAt: -1 }).toArray();
    return docs.map((doc) => normalize(doc as unknown as Record<string, unknown>));
  } catch {
    return starterTools.filter((tool) => (!options?.category || tool.category === options.category) && (options?.featured === undefined || tool.featured === options.featured));
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
