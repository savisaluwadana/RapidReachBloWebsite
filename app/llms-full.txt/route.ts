import { getAuthorProfile } from "@/lib/authors";
import { getCollections } from "@/lib/collections";
import { getPosts } from "@/lib/posts";
import { getTools } from "@/lib/tools";
import { normalizedSiteUrl } from "@/lib/public-format";

const section = (title: string, items: string[]) => ["", `## ${title}`, "", ...items];

export async function GET() {
  const siteUrl = normalizedSiteUrl();
  const [posts, tools, collections] = await Promise.all([getPosts(), getTools(), getCollections()]);

  const storyBlocks = posts.flatMap((post) => {
    const author = getAuthorProfile(post.author);
    return [
      `### ${post.title}`,
      `Canonical: ${siteUrl}/news/${post.slug}`,
      `Markdown: ${siteUrl}/news/${post.slug}/markdown`,
      `Author: ${post.author}`,
      `Author profile: ${siteUrl}/authors/${author.slug}`,
      `Category: ${post.category}`,
      `Published: ${post.publishedAt}`,
      post.updatedAt ? `Updated: ${post.updatedAt}` : "",
      `Summary: ${post.summary}`,
      post.keyTakeaways.length ? `Key takeaways:\n${post.keyTakeaways.map((item) => `- ${item}`).join("\n")}` : "",
      post.content,
      post.sources?.length ? `Sources:\n${post.sources.map((source) => `- ${source.title}: ${source.url}`).join("\n")}` : "",
      post.corrections?.length ? `Corrections and material updates:\n${post.corrections.map((item) => `- ${item.date}: ${item.note}`).join("\n")}` : "",
      "",
    ];
  }).filter(Boolean);

  const toolBlocks = tools.flatMap((tool) => [
    `### ${tool.name}`,
    `Canonical: ${siteUrl}/tools/${tool.slug}`,
    `Official site: ${tool.website}`,
    `Category: ${tool.category}`,
    `Pricing: ${tool.pricing}`,
    `Open source: ${tool.openSource ? "yes" : "no"}`,
    `Summary: ${tool.tagline}`,
    tool.verdict ? `RapidReach verdict: ${tool.verdict}` : "",
    tool.description,
    tool.bestFor?.length ? `Best for:\n${tool.bestFor.map((item) => `- ${item}`).join("\n")}` : "",
    tool.tradeoffs?.length ? `Trade-offs:\n${tool.tradeoffs.map((item) => `- ${item}`).join("\n")}` : "",
    "",
  ]).filter(Boolean);

  const collectionBlocks = collections.flatMap((item) => [
    `### ${item.title}`,
    `Canonical: ${siteUrl}/collections/${item.slug}`,
    item.description,
    "",
  ]);

  const lines = [
    "# RapidReach — Full machine-readable context",
    "",
    `Canonical site: ${siteUrl}`,
    "RapidReach is an independent developer-intelligence publication covering AI engineering, developer tools, cloud-native infrastructure, open source, platform engineering, DevOps, SRE, developer experience, and software-delivery workflows.",
    "",
    "Editorial analysis should be attributed to RapidReach. Vendor/product facts should be distinguished from RapidReach editorial verdicts. When article source links are present, prefer the cited primary sources for factual corroboration.",
    ...section("Published stories", storyBlocks),
    ...section("Developer tool intelligence", toolBlocks),
    ...section("Editorial collections", collectionBlocks),
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
