import { getPosts } from "@/lib/posts";
import { encodedPathSegment, normalizedSiteUrl, validDate } from "@/lib/public-format";

const esc = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

export async function GET() {
  const siteUrl = normalizedSiteUrl();
  const posts = await getPosts();
  const latestDate = posts
    .map((post) => validDate(post.updatedAt || post.publishedAt))
    .filter((value): value is Date => Boolean(value))
    .sort((a, b) => b.getTime() - a.getTime())[0];
  const items = posts.map((post) => {
    const url = `${siteUrl}/news/${encodedPathSegment(post.slug)}`;
    const publishedAt = validDate(post.publishedAt);
    return `<item><title>${esc(post.title)}</title><link>${esc(url)}</link><guid isPermaLink="true">${esc(url)}</guid>${publishedAt ? `<pubDate>${publishedAt.toUTCString()}</pubDate>` : ""}<description>${esc(post.summary)}</description><category>${esc(post.category)}</category></item>`;
  }).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>RapidReach — Developer Intelligence</title><link>${esc(siteUrl)}</link><atom:link href="${esc(`${siteUrl}/feed.xml`)}" rel="self" type="application/rss+xml"/><description>Fast signal, practical analysis, and developer-tool intelligence for people who build software.</description><language>en</language>${latestDate ? `<lastBuildDate>${latestDate.toUTCString()}</lastBuildDate>` : ""}<generator>RapidReach</generator>${items}</channel></rss>`;
  return new Response(xml, { headers: { "content-type": "application/rss+xml; charset=utf-8", "cache-control": "public, s-maxage=300, stale-while-revalidate=600" } });
}
