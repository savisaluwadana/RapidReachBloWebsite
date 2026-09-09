import type { Metadata } from "next";
import Link from "next/link";
import { ToolComparison } from "@/components/ToolComparison";
import { getTools } from "@/lib/tools";

export const metadata: Metadata = { title: "Compare Developer Tools", description: "Compare developer tools across pricing, open-source status, strengths, trade-offs, and RapidReach editorial verdicts." };
export const revalidate = 60;

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ tools?: string }> }) {
  const { tools: raw } = await searchParams;
  const slugs = String(raw || "").split(",").map((item) => item.trim()).filter(Boolean).slice(0, 4);
  const all = await getTools();
  const tools = slugs.map((slug) => all.find((tool) => tool.slug === slug)).filter(Boolean) as typeof all;
  return (
    <main className="comparison-page shell">
      <header className="comparison-hero"><span className="section-kicker">Developer tool comparison</span><h1>Choose with context, not feature-count theater.</h1><p>Compare the things that actually affect adoption: fit, pricing, openness, strengths, trade-offs, and the RapidReach editorial take.</p></header>
      {tools.length >= 2 ? <ToolComparison tools={tools} /> : <div className="account-empty"><h3>Select at least two tools.</h3><p>Use the directory comparison checkboxes to build a side-by-side view.</p><Link className="account-primary" href="/tools">Browse tools</Link></div>}
    </main>
  );
}
