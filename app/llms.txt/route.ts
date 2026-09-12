import { getCollections } from "@/lib/collections";
import { getPosts } from "@/lib/posts";
import { getTools } from "@/lib/tools";
import { normalizedSiteUrl } from "@/lib/public-format";

export async function GET() {
  const siteUrl = normalizedSiteUrl();
  const [posts, tools, collections] = await Promise.all([getPosts(), getTools(), getCollections()]);
  const lines = [
    "# RapidReach",
    "",
    "> Developer intelligence for people who build software: fast signal, practical analysis, curated stacks, and developer-tool intelligence.",
    "",
    "## Editorial surfaces",
    `- Signal Desk: ${siteUrl}/signals`,
    `- RapidReach Brief: ${siteUrl}/briefing`,
    `- Builder Stacks: ${siteUrl}/collections`,
    `- Tool Watch: ${siteUrl}/tools`,
    `- Editorial standards: ${siteUrl}/about`,
    "",
    "## Machine-readable resources",
    `- Posts API: ${siteUrl}/api/posts`,
    `- Tools API: ${siteUrl}/api/tools`,
    `- RSS: ${siteUrl}/feed.xml`,
    `- Sitemap: ${siteUrl}/sitemap.xml`,
    `- Tool comparison: ${siteUrl}/compare`,
    "",
    "## Published stories",
    ...posts.map((post) => `- [${post.title}](${siteUrl}/news/${post.slug}): ${post.summary}`),
    "",
    "## Developer tools",
    ...tools.map((tool) => `- [${tool.name}](${siteUrl}/tools/${tool.slug}): ${tool.verdict || tool.tagline}`),
    "",
    "## Editorial collections",
    ...collections.map((item) => `- [${item.title}](${siteUrl}/collections/${item.slug}): ${item.description}`),
  ];
  return new Response(lines.join("\n"), { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, s-maxage=300" } });
}
