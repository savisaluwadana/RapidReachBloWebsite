import { getCollections } from "@/lib/collections";
import { getPosts } from "@/lib/posts";
import { getTools } from "@/lib/tools";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rapidreach.dev";

export async function GET() {
  const [posts, tools, collections] = await Promise.all([getPosts(), getTools(), getCollections()]);
  const lines = [
    "# RapidReach",
    "",
    "> Developer news, analysis, comparisons, curated stacks, launch signals, and developer-tool intelligence for people who build software.",
    "",
    "## Machine-readable resources",
    `- Posts API: ${siteUrl}/api/posts`,
    `- Tools API: ${siteUrl}/api/tools`,
    `- RSS: ${siteUrl}/feed.xml`,
    `- Sitemap: ${siteUrl}/sitemap.xml`,
    `- Tool comparison: ${siteUrl}/compare`,
    `- Weekly launch board: ${siteUrl}/launches`,
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
