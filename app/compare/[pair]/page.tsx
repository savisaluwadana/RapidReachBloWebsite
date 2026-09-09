import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolComparison } from "@/components/ToolComparison";
import { getTools } from "@/lib/tools";

function resolvePair(pair: string, tools: Awaited<ReturnType<typeof getTools>>) {
  for (const first of tools) for (const second of tools) if (first.slug !== second.slug && `${first.slug}-vs-${second.slug}` === pair) return [first, second] as const;
  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ pair: string }> }): Promise<Metadata> {
  const { pair } = await params;
  const tools = await getTools();
  const resolved = resolvePair(pair, tools);
  if (!resolved) return {};
  const [a, b] = resolved;
  return { title: `${a.name} vs ${b.name}`, description: `Compare ${a.name} and ${b.name}: pricing, open-source status, strengths, trade-offs, best-fit teams, and RapidReach verdicts.`, alternates: { canonical: `/compare/${pair}` } };
}

export default async function PairComparePage({ params }: { params: Promise<{ pair: string }> }) {
  const { pair } = await params;
  const tools = await getTools();
  const resolved = resolvePair(pair, tools);
  if (!resolved) notFound();
  const [a, b] = resolved;
  return (
    <main className="comparison-page shell">
      <header className="comparison-hero"><span className="section-kicker">RapidReach comparison</span><h1>{a.name} <em>vs</em> {b.name}</h1><p>{a.tagline} Compare it with {b.name}: {b.tagline.toLowerCase()}</p></header>
      <ToolComparison tools={[a, b]} />
    </main>
  );
}
