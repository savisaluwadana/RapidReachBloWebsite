import { getPosts } from "@/lib/posts";
import { encodedPathSegment, normalizedSiteUrl, validDate } from "@/lib/public-format";

const esc = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

export async function GET() {
  const siteUrl = normalizedSiteUrl();
  const posts = await getPosts();
  const items = posts.map((post) => {
    const url = `${siteUrl}/news/${encodedPathSegment(post.slug)}`;
    const publishedAt = validDate(post.publishedAt);
    return `<item><title>${esc(post.title)}</title><link>${esc(url)}</link><guid>${esc(url)}</guid>${publishedAt ? `<pubDate>${publishedAt.toUTCString()}</pubDate>` : ""}<description>${esc(post.summary)}</description><category>${esc(post.category)}</category></item>`;
  }).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>RapidReach</title><link>${esc(siteUrl)}</link><description>Developer news without the noise.</description><language>en</language>${items}</channel></rss>`;
  return new Response(xml, { headers: { "content-type": "application/rss+xml; charset=utf-8", "cache-control": "public, s-maxage=300, stale-while-revalidate=600" } });
}
