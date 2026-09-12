import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolComparison } from "@/components/ToolComparison";
import { getTools } from "@/lib/tools";

const MAX_PAIR_LENGTH = 300;

function resolvePair(pair: string, tools: Awaited<ReturnType<typeof getTools>>) {
  if (!pair || pair.length > MAX_PAIR_LENGTH) return null;
  const bySlug = new Map(tools.map((tool) => [tool.slug, tool]));
  for (const first of tools) {
    const prefix = `${first.slug}-vs-`;
    if (!pair.startsWith(prefix)) continue;
    const second = bySlug.get(pair.slice(prefix.length));
    if (second && second.slug !== first.slug) return [first, second] as const;
  }
  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ pair: string }> }): Promise<Metadata> {
  const { pair } = await params;
  const tools = await getTools();
  const resolved = resolvePair(pair, tools);
  if (!resolved) return { title: "Comparison not found", robots: { index: false, follow: false } };
  const [a, b] = resolved;
  const title = `${a.name} vs ${b.name}`;
  const description = `Compare ${a.name} and ${b.name}: pricing, open-source status, strengths, trade-offs, best-fit teams, and RapidReach verdicts.`;
  const url = `/compare/${pair}`;
  return {
    title,
    description,
    keywords: [a.name, b.name, `${a.name} vs ${b.name}`, "developer tool comparison"],
    alternates: { canonical: url },
    openGraph: { title: `${title} | RapidReach`, description, url, type: "website" },
    twitter: { card: "summary_large_image", title: `${title} | RapidReach`, description },
  };
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
