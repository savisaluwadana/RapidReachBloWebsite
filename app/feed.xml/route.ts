import { getPosts } from "@/lib/posts";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rapidreach.dev";
const esc = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

export async function GET() {
  const posts = await getPosts(); const items = posts.map((post) => `<item><title>${esc(post.title)}</title><link>${siteUrl}/news/${post.slug}</link><guid>${siteUrl}/news/${post.slug}</guid><pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate><description>${esc(post.summary)}</description><category>${esc(post.category)}</category></item>`).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>RapidReach</title><link>${siteUrl}</link><description>Developer news without the noise.</description><language>en</language>${items}</channel></rss>`;
  return new Response(xml, { headers: { "content-type": "application/rss+xml; charset=utf-8", "cache-control": "public, s-maxage=300" } });
}
