import { getCollections } from "@/lib/collections";
import { getPosts } from "@/lib/posts";
import { getTools } from "@/lib/tools";
import { normalizedSiteUrl } from "@/lib/public-format";
import {
  publicPostsForAgents,
  renderCollectionMarkdown,
  renderPostMarkdown,
  renderToolMarkdown,
} from "@/lib/agent-content";

function nestedDocument(markdown: string) {
  return markdown.replace(/^(#{1,4}) /gm, (_match, hashes: string) =>
    `${"#".repeat(Math.min(6, hashes.length + 2))} `,
  );
}

export async function GET() {
  const siteUrl = normalizedSiteUrl();
  const [allPosts, tools, collections] = await Promise.all([getPosts(), getTools(), getCollections()]);
  const posts = publicPostsForAgents(allPosts);
  const toolMap = new Map(tools.map((tool) => [tool.slug, tool]));
  const postMap = new Map(posts.map((post) => [post.slug, post]));

  const storyBlocks = posts.map((post) => nestedDocument(renderPostMarkdown(post, siteUrl)));

  const toolBlocks = tools.map((tool) => {
    const alternatives = (tool.alternatives || [])
      .map((slug) => toolMap.get(slug))
      .filter(Boolean) as typeof tools;
    const relatedPosts = (tool.relatedPostSlugs || [])
      .map((slug) => postMap.get(slug))
      .filter(Boolean) as typeof posts;
    return nestedDocument(renderToolMarkdown(tool, siteUrl, { alternatives, relatedPosts }));
  });

  const collectionBlocks = collections.map((collection) => {
    const collectionTools = collection.toolSlugs
      .map((slug) => toolMap.get(slug))
      .filter(Boolean) as typeof tools;
    const collectionPosts = collection.postSlugs
      .map((slug) => postMap.get(slug))
      .filter(Boolean) as typeof posts;
    return nestedDocument(renderCollectionMarkdown(collection, siteUrl, collectionTools, collectionPosts));
  });

  const lines = [
    "# RapidReach — Full machine-readable context",
    "",
    `Canonical site: ${siteUrl}`,
    `Discovery index: ${siteUrl}/llms.txt`,
    `Structured catalog: ${siteUrl}/api/agent/catalog`,
    "",
    "This document contains only content currently exposed as public by RapidReach. RapidReach analysis should be attributed to RapidReach. Product facts that can change over time should be checked against official links included in tool records.",
    "",
    "## Stories",
    "",
    ...storyBlocks.flatMap((block) => [block, ""]),
    "## Developer tools",
    "",
    ...toolBlocks.flatMap((block) => [block, ""]),
    "## Collections",
    "",
    ...collectionBlocks.flatMap((block) => [block, ""]),
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, s-maxage=300, stale-while-revalidate=600",
      Link: `<${siteUrl}/llms.txt>; rel="describedby"`,
    },
  });
}
