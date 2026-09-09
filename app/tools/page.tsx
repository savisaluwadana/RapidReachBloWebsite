import type { Metadata } from "next";
import Link from "next/link";
import { ToolCard } from "@/components/ToolCard";
import { getCategoriesByKind } from "@/lib/categories";
import { getTools } from "@/lib/tools";

export const metadata: Metadata = {
  title: "Developer Tools Directory",
  description: "Discover developer tools across AI, platform engineering, observability, CI/CD, databases, security, and modern software delivery.",
  alternates: { canonical: "/tools" },
};

export const revalidate = 60;

export default async function ToolsPage() {
  const [tools, categories] = await Promise.all([getTools(), getCategoriesByKind("tool")]);
  const featured = tools.filter((tool) => tool.featured);
  const rest = tools.filter((tool) => !tool.featured);
  return (
    <div className="tools-page shell">
      <header className="tools-hero">
        <span className="section-kicker">Developer tool discovery</span>
        <h1>Find the tools shaping how software gets built.</h1>
        <p>Curated developer products with practical explanations, pricing context, open-source signals, and direct links. No infinite feed.</p>
        <div className="tools-hero-actions"><Link className="account-primary" href="/submit-tool">Submit a tool for review</Link><span>Community submissions are reviewed by RapidReach before publication.</span></div>
        <div className="tools-category-strip">{categories.map((category) => <Link key={category.slug} href={`/tools/category/${category.slug}`}>{category.name}</Link>)}</div>
      </header>

      {featured.length > 0 && <section className="tools-section"><div className="section-heading"><div><span className="section-kicker">Editors’ picks</span><h2>Featured tools</h2></div><span className="issue-line">Curated by RapidReach</span></div><div className="tool-list featured">{featured.map((tool) => <ToolCard key={tool.slug} tool={tool}/>)}</div></section>}

      <section className="tools-section"><div className="section-heading"><div><span className="section-kicker">Directory</span><h2>Latest tools</h2></div><span className="issue-line">{tools.length} listed</span></div><div className="tool-list">{rest.length ? rest.map((tool) => <ToolCard key={tool.slug} tool={tool}/>) : featured.map((tool) => <ToolCard key={tool.slug} tool={tool}/>)}</div></section>
    </div>
  );
}
