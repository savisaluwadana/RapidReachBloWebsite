import { getCollectionBySlug } from "@/lib/collections";
import { getPosts } from "@/lib/posts";
import { getTools } from "@/lib/tools";
import { normalizedSiteUrl } from "@/lib/public-format";
import {
  collectionCanonicalUrl,
  markdownDiscoveryHeaders,
  publicPostsForAgents,
  renderCollectionMarkdown,
} from "@/lib/agent-content";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) return new Response("Not found", { status: 404 });

  const [allTools, allPosts] = await Promise.all([getTools(), getPosts()]);
  const publicPosts = publicPostsForAgents(allPosts);
  const tools = collection.toolSlugs
    .map((item) => allTools.find((tool) => tool.slug === item))
    .filter(Boolean) as typeof allTools;
  const posts = collection.postSlugs
    .map((item) => publicPosts.find((post) => post.slug === item))
    .filter(Boolean) as typeof publicPosts;

  const siteUrl = normalizedSiteUrl();
  const canonical = collectionCanonicalUrl(siteUrl, collection);
  return new Response(renderCollectionMarkdown(collection, siteUrl, tools, posts), {
    headers: markdownDiscoveryHeaders(canonical, siteUrl, collection.updatedAt || collection.createdAt, `${siteUrl}/collections/llms.txt`),
  });
}
