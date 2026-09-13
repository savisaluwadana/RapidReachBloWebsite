import type { MetadataRoute } from "next";
import { authorSlug } from "@/lib/authors";
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

function latestIso(values: Array<string | undefined>) {
  const latest = values
    .map((value) => validDate(value))
    .filter((value): value is Date => Boolean(value))
    .sort((a, b) => b.getTime() - a.getTime())[0];
  return latest?.toISOString();
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
  const authors = [...new Set(posts.map((post) => authorSlug(post.author)).filter(Boolean))];
  const latestPostDate = latestIso(posts.map((post) => post.updatedAt || post.publishedAt));
  const latestToolDate = latestIso(tools.map((tool) => tool.updatedAt || tool.launchedAt));
  const latestCollectionDate = latestIso(collections.map((item) => item.updatedAt || item.createdAt));
  const latestSiteDate = latestIso([latestPostDate, latestToolDate, latestCollectionDate]);

  return [
    datedEntry(siteUrl, latestSiteDate, "daily", 1),
    datedEntry(`${siteUrl}/signals`, latestPostDate, "daily", 0.95),
    datedEntry(`${siteUrl}/tools`, latestToolDate, "daily", 0.9),
    datedEntry(`${siteUrl}/collections`, latestCollectionDate, "weekly", 0.8),
    datedEntry(`${siteUrl}/briefing`, latestSiteDate, "weekly", 0.7),
    datedEntry(`${siteUrl}/compare`, latestToolDate, "weekly", 0.6),
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.6 },
    ...authors.map((slug) => datedEntry(
      `${siteUrl}/authors/${encodedPathSegment(slug)}`,
      latestIso(posts.filter((post) => authorSlug(post.author) === slug).map((post) => post.updatedAt || post.publishedAt)),
      "weekly",
      0.7,
    )),
    ...collections.map((item) => datedEntry(
      `${siteUrl}/collections/${encodedPathSegment(item.slug)}`,
      item.updatedAt || item.createdAt,
      "weekly",
      0.8,
    )),
    ...postCategories.map((category) => datedEntry(
      `${siteUrl}/category/${encodedPathSegment(category)}`,
      latestIso(posts.filter((post) => post.category === category).map((post) => post.updatedAt || post.publishedAt)),
      "daily",
      0.7,
    )),
    ...toolCategories.map((category) => datedEntry(
      `${siteUrl}/tools/category/${encodedPathSegment(category.slug)}`,
      latestIso(tools.filter((tool) => tool.category === category.slug).map((tool) => tool.updatedAt || tool.launchedAt)),
      "weekly",
      0.7,
    )),
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
