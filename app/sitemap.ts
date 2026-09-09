import type { MetadataRoute } from "next";
import { getCategoriesByKind } from "@/lib/categories";
import { getCollections } from "@/lib/collections";
import { getPosts } from "@/lib/posts";
import { getTools } from "@/lib/tools";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rapidreach.dev";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, tools, toolCategories, collections] = await Promise.all([getPosts(), getTools(), getCategoriesByKind("tool"), getCollections()]);
  const postCategories = [...new Set(posts.map((post) => post.category))];
  return [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/search`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
    { url: `${siteUrl}/tools`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/launches`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/collections`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/briefing`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${siteUrl}/compare`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    ...collections.map((item) => ({ url: `${siteUrl}/collections/${item.slug}`, lastModified: new Date(item.updatedAt || item.createdAt), changeFrequency: "weekly" as const, priority: 0.8 })),
    ...postCategories.map((category) => ({ url: `${siteUrl}/category/${encodeURIComponent(category)}`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.7 })),
    ...toolCategories.map((category) => ({ url: `${siteUrl}/tools/category/${category.slug}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 })),
    ...posts.map((post) => ({ url: `${siteUrl}/news/${post.slug}`, lastModified: new Date(post.updatedAt || post.publishedAt), changeFrequency: "weekly" as const, priority: 0.9 })),
    ...tools.map((tool) => ({ url: `${siteUrl}/tools/${tool.slug}`, lastModified: new Date(tool.updatedAt || tool.launchedAt), changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
