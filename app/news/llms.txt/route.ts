import { getPosts } from "@/lib/posts";
import { normalizedSiteUrl } from "@/lib/public-format";
import { agentLinkLabel, cleanAgentInline, postMarkdownUrl, publicPostsForAgents } from "@/lib/agent-content";

export async function GET() {
  const siteUrl = normalizedSiteUrl();
  const posts = publicPostsForAgents(await getPosts());
  const lines = [
    "# RapidReach Stories",
    "",
    "> Published RapidReach reporting and analysis for software builders.",
    "",
    "Only currently public stories are listed. Future-dated stories are omitted. Story Markdown includes author, publication metadata, article content, sources, and correction notes when present.",
    "",
    "## Stories",
    "",
    ...posts.map((post) =>
      `- [${agentLinkLabel(post.title)}](${postMarkdownUrl(siteUrl, post)}): ${cleanAgentInline(post.summary)}`,
    ),
    "",
    "## Optional",
    "",
    `- [RapidReach root index](${siteUrl}/llms.txt): Site-wide agent discovery.`,
    `- [RSS feed](${siteUrl}/feed.xml): Published story feed.`,
    `- [Signal Desk](${siteUrl}/signals): Human-readable story stream.`,
  ];
  return new Response(lines.join("\n"), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
