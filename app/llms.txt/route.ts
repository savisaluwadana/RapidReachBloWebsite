import { getCollections } from "@/lib/collections";
import { getPosts } from "@/lib/posts";
import { getTools } from "@/lib/tools";
import { normalizedSiteUrl } from "@/lib/public-format";
import {
  agentLinkLabel,
  cleanAgentInline,
  collectionMarkdownUrl,
  postMarkdownUrl,
  publicPostsForAgents,
  toolMarkdownUrl,
} from "@/lib/agent-content";

const MAX_STORIES = 24;
const MAX_TOOLS = 24;
const MAX_COLLECTIONS = 16;

export async function GET() {
  const siteUrl = normalizedSiteUrl();
  const [allPosts, tools, collections] = await Promise.all([getPosts(), getTools(), getCollections()]);
  const posts = publicPostsForAgents(allPosts);

  const lines = [
    "# RapidReach",
    "",
    "> Developer intelligence, software-engineering analysis, developer-tool profiles, and curated engineering collections.",
    "",
    "This index is generated from RapidReach’s currently public content. Draft records are excluded, and future-dated stories are omitted from agent discovery. RapidReach verdicts and recommendations are editorial analysis; decision-critical product facts should be verified against the official website or repository linked from each tool page.",
    "",
    "## Core",
    "",
    `- [Full machine-readable context](${siteUrl}/llms-full.txt): Expanded RapidReach context containing current public stories, tools, collections, sources, and editorial analysis.`,
    `- [Agent catalog](${siteUrl}/api/agent/catalog): Structured JSON index of the same public entities with canonical and Markdown URLs.`,
    `- [Editorial standards](${siteUrl}/about): How RapidReach handles sourcing, analysis, corrections, and tool coverage.`,
    "",
    "## Latest stories",
    "",
    ...posts.slice(0, MAX_STORIES).map((post) =>
      `- [${agentLinkLabel(post.title)}](${postMarkdownUrl(siteUrl, post)}): ${cleanAgentInline(post.summary)}`,
    ),
    "",
    "## Developer tools",
    "",
    ...tools.slice(0, MAX_TOOLS).map((tool) =>
      `- [${agentLinkLabel(tool.name)}](${toolMarkdownUrl(siteUrl, tool)}): ${cleanAgentInline(tool.tagline)}`,
    ),
    "",
    "## Collections",
    "",
    ...collections.slice(0, MAX_COLLECTIONS).map((collection) =>
      `- [${agentLinkLabel(collection.title)}](${collectionMarkdownUrl(siteUrl, collection)}): ${cleanAgentInline(collection.description)}`,
    ),
    "",
    "## Optional",
    "",
    `- [Signal Desk](${siteUrl}/signals): Human-readable stream of current RapidReach stories.`,
    `- [Tool directory](${siteUrl}/tools): Human-readable developer-tool discovery surface.`,
    `- [Collections index](${siteUrl}/collections): Human-readable curated engineering collections.`,
    `- [RSS feed](${siteUrl}/feed.xml): Published story feed.`,
    `- [XML sitemap](${siteUrl}/sitemap.xml): Indexable human-facing URLs.`,
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
