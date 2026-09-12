import type { Metadata } from "next";
import Link from "next/link";
import { ToolComparison } from "@/components/ToolComparison";
import { getTools } from "@/lib/tools";

export const metadata: Metadata = { title: "Compare Developer Tools", description: "Compare developer tools across pricing, open-source status, strengths, trade-offs, and RapidReach editorial verdicts." };
export const revalidate = 60;

const MAX_TOOL_SLUG_LENGTH = 120;

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ tools?: string | string[] }> }) {
  const { tools: raw } = await searchParams;
  const rawValue = Array.isArray(raw) ? raw[0] || "" : raw || "";
  const slugs = [...new Set(rawValue
    .slice(0, 600)
    .split(",")
    .map((item) => item.trim().slice(0, MAX_TOOL_SLUG_LENGTH))
    .filter(Boolean))]
    .slice(0, 4);
  const all = await getTools();
  const bySlug = new Map(all.map((tool) => [tool.slug, tool]));
  const tools = slugs.map((slug) => bySlug.get(slug)).filter(Boolean) as typeof all;
  return (
    <main className="comparison-page shell">
      <header className="comparison-hero"><span className="section-kicker">Developer tool comparison</span><h1>Choose with context, not feature-count theater.</h1><p>Compare the things that actually affect adoption: fit, pricing, openness, strengths, trade-offs, and the RapidReach editorial take.</p></header>
      {tools.length >= 2 ? <ToolComparison tools={tools} /> : <div className="account-empty"><h3>Select at least two different tools.</h3><p>Use the directory comparison checkboxes to build a side-by-side view.</p><Link className="account-primary" href="/tools">Browse tools</Link></div>}
    </main>
  );
}
