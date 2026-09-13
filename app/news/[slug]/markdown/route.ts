import { getAuthorProfile } from "@/lib/authors";
import { getPostBySlug } from "@/lib/posts";
import { encodedPathSegment, normalizedSiteUrl } from "@/lib/public-format";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return new Response("Not found", { status: 404 });

  const siteUrl = normalizedSiteUrl();
  const canonical = `${siteUrl}/news/${encodedPathSegment(post.slug)}`;
  const author = getAuthorProfile(post.author);
  const lines = [
    `# ${post.title}`,
    "",
    `Canonical: ${canonical}`,
    `Author: ${author.name}`,
    `Author profile: ${siteUrl}/authors/${author.slug}`,
    `Published: ${post.publishedAt}`,
    post.updatedAt ? `Updated: ${post.updatedAt}` : "",
    `Category: ${post.category}`,
    post.tags.length ? `Tags: ${post.tags.join(", ")}` : "",
    "",
    `> ${post.summary}`,
    "",
    post.keyTakeaways.length ? "## Key takeaways" : "",
    ...post.keyTakeaways.map((item) => `- ${item}`),
    post.keyTakeaways.length ? "" : "",
    "## Article",
    "",
    post.content,
    "",
    post.sources?.length ? "## Sources" : "",
    ...(post.sources || []).map((source) => `- [${source.title}](${source.url})`),
    post.sources?.length ? "" : "",
    post.corrections?.length ? "## Corrections and material updates" : "",
    ...(post.corrections || []).map((correction) => `- ${correction.date}: ${correction.note}`),
    "",
    "---",
    `Source: RapidReach — ${canonical}`,
  ].filter((line, index, array) => line !== "" || array[index - 1] !== "");

  return new Response(lines.join("\n"), {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "public, s-maxage=300, stale-while-revalidate=600",
      Link: `<${canonical}>; rel="canonical"; type="text/html"`,
    },
  });
}
