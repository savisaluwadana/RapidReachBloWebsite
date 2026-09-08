import { getPosts } from "@/lib/posts";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rapidreach.dev";
export async function GET() {
  const posts = await getPosts(); const lines = ["# RapidReach", "", "> Developer news and analysis for people who build software.", "", "## Machine-readable resources", `- Posts API: ${siteUrl}/api/posts`, `- RSS: ${siteUrl}/feed.xml`, `- Sitemap: ${siteUrl}/sitemap.xml`, "", "## Published stories", ...posts.map((post) => `- [${post.title}](${siteUrl}/news/${post.slug}): ${post.summary}`)];
  return new Response(lines.join("\n"), { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, s-maxage=300" } });
}
