import type { MetadataRoute } from "next";
import { getCategoriesByKind } from "@/lib/categories";
import { getCollections } from "@/lib/collections";
import { getPosts } from "@/lib/posts";
import { getTools } from "@/lib/tools";
import { encodedPathSegment, normalizedSiteUrl, validDate } from "@/lib/public-format";

function datedEntry(
  url: string,
  value: string | undefined,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  priority: number,
): MetadataRoute.Sitemap[number] {
  const date = validDate(value);
  return {
    url,
    ...(date ? { lastModified: date } : {}),
    changeFrequency,
    priority,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = normalizedSiteUrl();
  const [posts, tools, toolCategories, collections] = await Promise.all([
    getPosts(),
    getTools(),
    getCategoriesByKind("tool"),
    getCollections(),
  ]);
  const postCategories = [...new Set(posts.map((post) => post.category).filter(Boolean))];
  const now = new Date();

  return [
    { url: siteUrl, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/signals`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${siteUrl}/search`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: `${siteUrl}/tools`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/launches`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/collections`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/briefing`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/compare`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${siteUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    ...collections.map((item) => datedEntry(
      `${siteUrl}/collections/${encodedPathSegment(item.slug)}`,
      item.updatedAt || item.createdAt,
      "weekly",
      0.8,
    )),
    ...postCategories.map((category) => ({
      url: `${siteUrl}/category/${encodedPathSegment(category)}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...toolCategories.map((category) => ({
      url: `${siteUrl}/tools/category/${encodedPathSegment(category.slug)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...posts.map((post) => datedEntry(
      `${siteUrl}/news/${encodedPathSegment(post.slug)}`,
      post.updatedAt || post.publishedAt,
      "weekly",
      0.9,
    )),
    ...tools.map((tool) => datedEntry(
      `${siteUrl}/tools/${encodedPathSegment(tool.slug)}`,
      tool.updatedAt || tool.launchedAt,
      "weekly",
      0.8,
    )),
  ];
}
