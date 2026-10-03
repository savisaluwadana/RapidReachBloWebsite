import { getCollections } from "@/lib/collections";
import { normalizedSiteUrl } from "@/lib/public-format";
import { agentLinkLabel, cleanAgentInline, collectionMarkdownUrl } from "@/lib/agent-content";

export async function GET() {
  const siteUrl = normalizedSiteUrl();
  const collections = await getCollections();
  const lines = [
    "# RapidReach Collections",
    "",
    "> Curated RapidReach collections that group developer tools and related stories around an engineering topic or workflow.",
    "",
    "Each collection Markdown document links to the currently public tool and story records that belong to the collection.",
    "",
    "## Collections",
    "",
    ...collections.map((collection) =>
      `- [${agentLinkLabel(collection.title)}](${collectionMarkdownUrl(siteUrl, collection)}): ${cleanAgentInline(collection.description)}`,
    ),
    "",
    "## Optional",
    "",
    `- [RapidReach root index](${siteUrl}/llms.txt): Site-wide agent discovery.`,
    `- [Collections index](${siteUrl}/collections): Human-readable collection discovery.`,
  ];
  return new Response(lines.join("\n"), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
