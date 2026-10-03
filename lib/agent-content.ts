import { getAuthorProfile } from "@/lib/authors";
import { encodedPathSegment, validDate } from "@/lib/public-format";
import type { EditorialCollection, Post, Tool } from "@/lib/types";

export function cleanAgentInline(value: string | undefined | null) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

export function agentLinkLabel(value: string) {
  return cleanAgentInline(value).replace(/([\\\[\]])/g, "\\$1");
}

export function publicPostsForAgents(posts: Post[], now = Date.now()) {
  return posts.filter((post) => {
    if (post.status !== "published") return false;
    const published = validDate(post.publishedAt);
    return !published || published.getTime() <= now;
  });
}

export function postCanonicalUrl(siteUrl: string, post: Post) {
  return `${siteUrl}/news/${encodedPathSegment(post.slug)}`;
}

export function postMarkdownUrl(siteUrl: string, post: Post) {
  return `${postCanonicalUrl(siteUrl, post)}/index.md`;
}

export function toolCanonicalUrl(siteUrl: string, tool: Tool) {
  return `${siteUrl}/tools/${encodedPathSegment(tool.slug)}`;
}

export function toolMarkdownUrl(siteUrl: string, tool: Tool) {
  return `${toolCanonicalUrl(siteUrl, tool)}/index.md`;
}

export function collectionCanonicalUrl(siteUrl: string, collection: EditorialCollection) {
  return `${siteUrl}/collections/${encodedPathSegment(collection.slug)}`;
}

export function collectionMarkdownUrl(siteUrl: string, collection: EditorialCollection) {
  return `${collectionCanonicalUrl(siteUrl, collection)}/index.md`;
}

export function markdownDiscoveryHeaders(canonical: string, siteUrl: string, lastModified?: string) {
  const modified = validDate(lastModified);
  return {
    "content-type": "text/markdown; charset=utf-8",
    "cache-control": "public, s-maxage=300, stale-while-revalidate=600",
    Link: `<${canonical}>; rel="canonical"; type="text/html", <${siteUrl}/llms.txt>; rel="describedby"`,
    ...(modified ? { "last-modified": modified.toUTCString() } : {}),
  };
}

export function renderPostMarkdown(post: Post, siteUrl: string) {
  const canonical = postCanonicalUrl(siteUrl, post);
  const markdown = postMarkdownUrl(siteUrl, post);
  const author = getAuthorProfile(post.author);
  const lines = [
    `# ${post.title}`,
    "",
    `Canonical: ${canonical}`,
    `Markdown: ${markdown}`,
    `Author: ${author.name}`,
    `Author profile: ${siteUrl}/authors/${encodedPathSegment(author.slug)}`,
    `Published: ${post.publishedAt}`,
    post.updatedAt ? `Updated: ${post.updatedAt}` : "",
    `Category: ${post.category}`,
    post.tags.length ? `Tags: ${post.tags.join(", ")}` : "",
    "",
    `> ${cleanAgentInline(post.summary)}`,
    "",
    post.keyTakeaways.length ? "## Key takeaways" : "",
    ...post.keyTakeaways.map((item) => `- ${cleanAgentInline(item)}`),
    post.keyTakeaways.length ? "" : "",
    "## Article",
    "",
    post.content.trim(),
    "",
    post.sources?.length ? "## Sources" : "",
    ...(post.sources || []).map((source) => `- [${agentLinkLabel(source.title)}](${source.url})`),
    post.sources?.length ? "" : "",
    post.corrections?.length ? "## Corrections and material updates" : "",
    ...(post.corrections || []).map((item) => `- ${item.date}: ${cleanAgentInline(item.note)}`),
    "",
    "---",
    `Source: RapidReach — ${canonical}`,
  ];
  return lines.filter((line, index, array) => line !== "" || array[index - 1] !== "").join("\n");
}

export function renderToolMarkdown(
  tool: Tool,
  siteUrl: string,
  context: { alternatives?: Tool[]; relatedPosts?: Post[] } = {},
) {
  const canonical = toolCanonicalUrl(siteUrl, tool);
  const markdown = toolMarkdownUrl(siteUrl, tool);
  const lines = [
    `# ${tool.name}`,
    "",
    `Canonical: ${canonical}`,
    `Markdown: ${markdown}`,
    `Official website: ${tool.website}`,
    tool.github ? `GitHub: ${tool.github}` : "",
    tool.maker ? `Maker: ${tool.maker}` : "",
    `Category: ${tool.category}`,
    `Pricing: ${tool.pricing}`,
    `Open source: ${tool.openSource ? "yes" : "no"}`,
    `Launched: ${tool.launchedAt}`,
    tool.updatedAt ? `Updated: ${tool.updatedAt}` : "",
    "",
    `> ${cleanAgentInline(tool.tagline)}`,
    "",
    "## Description",
    "",
    tool.description.trim(),
    "",
    tool.verdict ? "## RapidReach analysis" : "",
    tool.verdict ? "" : "",
    tool.verdict ? cleanAgentInline(tool.verdict) : "",
    tool.verdict ? "" : "",
    tool.bestFor?.length ? "## Best for" : "",
    ...(tool.bestFor || []).map((item) => `- ${cleanAgentInline(item)}`),
    tool.bestFor?.length ? "" : "",
    tool.notIdealFor?.length ? "## Not ideal for" : "",
    ...(tool.notIdealFor || []).map((item) => `- ${cleanAgentInline(item)}`),
    tool.notIdealFor?.length ? "" : "",
    tool.strengths?.length ? "## Strengths" : "",
    ...(tool.strengths || []).map((item) => `- ${cleanAgentInline(item)}`),
    tool.strengths?.length ? "" : "",
    tool.tradeoffs?.length ? "## Trade-offs" : "",
    ...(tool.tradeoffs || []).map((item) => `- ${cleanAgentInline(item)}`),
    tool.tradeoffs?.length ? "" : "",
    context.alternatives?.length ? "## Alternatives" : "",
    ...(context.alternatives || []).map((item) =>
      `- [${agentLinkLabel(item.name)}](${toolMarkdownUrl(siteUrl, item)}): ${cleanAgentInline(item.tagline)}`,
    ),
    context.alternatives?.length ? "" : "",
    context.relatedPosts?.length ? "## Related stories" : "",
    ...(context.relatedPosts || []).map((post) =>
      `- [${agentLinkLabel(post.title)}](${postMarkdownUrl(siteUrl, post)}): ${cleanAgentInline(post.summary)}`,
    ),
    "",
    "---",
    "RapidReach analysis is editorial context. Product facts such as current pricing, licensing, and capabilities should be verified against the official website or repository when they are decision-critical.",
    `Source: RapidReach — ${canonical}`,
  ];
  return lines.filter((line, index, array) => line !== "" || array[index - 1] !== "").join("\n");
}

export function renderCollectionMarkdown(
  collection: EditorialCollection,
  siteUrl: string,
  tools: Tool[],
  posts: Post[],
) {
  const canonical = collectionCanonicalUrl(siteUrl, collection);
  const markdown = collectionMarkdownUrl(siteUrl, collection);
  const lines = [
    `# ${collection.title}`,
    "",
    `Canonical: ${canonical}`,
    `Markdown: ${markdown}`,
    `Created: ${collection.createdAt}`,
    collection.updatedAt ? `Updated: ${collection.updatedAt}` : "",
    "",
    `> ${cleanAgentInline(collection.description)}`,
    "",
    tools.length ? "## Tools" : "",
    ...tools.map((tool) =>
      `- [${agentLinkLabel(tool.name)}](${toolMarkdownUrl(siteUrl, tool)}): ${cleanAgentInline(tool.tagline)}`,
    ),
    tools.length ? "" : "",
    posts.length ? "## Stories" : "",
    ...posts.map((post) =>
      `- [${agentLinkLabel(post.title)}](${postMarkdownUrl(siteUrl, post)}): ${cleanAgentInline(post.summary)}`,
    ),
    "",
    "---",
    "This collection is an editorial grouping. Follow the linked entity pages for detailed context and provenance.",
    `Source: RapidReach — ${canonical}`,
  ];
  return lines.filter((line, index, array) => line !== "" || array[index - 1] !== "").join("\n");
}
