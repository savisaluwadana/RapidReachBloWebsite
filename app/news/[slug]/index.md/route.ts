import { getPostBySlug } from "@/lib/posts";
import { normalizedSiteUrl } from "@/lib/public-format";
import { markdownDiscoveryHeaders, postCanonicalUrl, publicPostsForAgents, renderPostMarkdown } from "@/lib/agent-content";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || publicPostsForAgents([post]).length === 0) return new Response("Not found", { status: 404 });

  const siteUrl = normalizedSiteUrl();
  const canonical = postCanonicalUrl(siteUrl, post);
  return new Response(renderPostMarkdown(post, siteUrl), {
    headers: markdownDiscoveryHeaders(canonical, siteUrl, post.updatedAt || post.publishedAt),
  });
}
