import { getTools } from "@/lib/tools";
import { normalizedSiteUrl } from "@/lib/public-format";
import { agentLinkLabel, cleanAgentInline, toolMarkdownUrl } from "@/lib/agent-content";

export async function GET() {
  const siteUrl = normalizedSiteUrl();
  const tools = await getTools();
  const lines = [
    "# RapidReach Developer Tools",
    "",
    "> Published RapidReach developer-tool profiles with editorial context and links to official product sources.",
    "",
    "Tool Markdown separates RapidReach analysis from product metadata and links to the official website or repository for facts that may change over time.",
    "",
    "## Tools",
    "",
    ...tools.map((tool) =>
      `- [${agentLinkLabel(tool.name)}](${toolMarkdownUrl(siteUrl, tool)}): ${cleanAgentInline(tool.tagline)}`,
    ),
    "",
    "## Optional",
    "",
    `- [RapidReach root index](${siteUrl}/llms.txt): Site-wide agent discovery.`,
    `- [Tool directory](${siteUrl}/tools): Human-readable tool discovery.`,
    `- [Tool comparison](${siteUrl}/compare): Human-readable comparison entry point.`,
  ];
  return new Response(lines.join("\n"), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
