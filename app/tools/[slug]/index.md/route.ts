import { getPosts } from "@/lib/posts";
import { getToolBySlug, getTools } from "@/lib/tools";
import { normalizedSiteUrl } from "@/lib/public-format";
import {
  markdownDiscoveryHeaders,
  publicPostsForAgents,
  renderToolMarkdown,
  toolCanonicalUrl,
} from "@/lib/agent-content";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);
  if (!tool) return new Response("Not found", { status: 404 });

  const [allTools, posts] = await Promise.all([getTools(), getPosts()]);
  const publicPosts = publicPostsForAgents(posts);
  const alternatives = (tool.alternatives || [])
    .map((item) => allTools.find((candidate) => candidate.slug === item))
    .filter(Boolean) as typeof allTools;
  const relatedPosts = (tool.relatedPostSlugs || [])
    .map((item) => publicPosts.find((post) => post.slug === item))
    .filter(Boolean) as typeof publicPosts;

  const siteUrl = normalizedSiteUrl();
  const canonical = toolCanonicalUrl(siteUrl, tool);
  return new Response(renderToolMarkdown(tool, siteUrl, { alternatives, relatedPosts }), {
    headers: markdownDiscoveryHeaders(canonical, siteUrl, tool.updatedAt || tool.launchedAt),
  });
}
