import type { Metadata } from "next";
import Link from "next/link";
import { ToolExplorer } from "@/components/ToolExplorer";
import { getCategoriesByKind } from "@/lib/categories";
import { getTools } from "@/lib/tools";
import { getCollections } from "@/lib/collections";

export const metadata: Metadata = {
  title: "Developer Tools Directory",
  description: "Discover and compare developer tools across AI, platform engineering, observability, CI/CD, databases, security, and modern software delivery.",
  alternates: { canonical: "/tools" },
};

export const revalidate = 60;

export default async function ToolsPage() {
  const [tools, categories, collections] = await Promise.all([getTools(), getCategoriesByKind("tool"), getCollections()]);
  return (
    <div className="tools-page shell">
      <header className="tools-hero">
        <span className="section-kicker">Developer tool intelligence</span>
        <h1>Find the right tool, not just another tool.</h1>
        <p>Search, filter, compare, and evaluate developer products with pricing context, open-source signals, editorial verdicts, alternatives, and practical fit.</p>
        <div className="tools-hero-actions"><Link className="account-primary" href="/submit-tool">Submit a tool for review</Link><Link className="account-secondary" href="/launches">This week’s launch board</Link><Link className="account-secondary" href="/collections">Editorial collections</Link></div>
        <div className="tools-category-strip">{categories.map((category) => <Link key={category.slug} href={`/tools/category/${category.slug}`}>{category.name}</Link>)}</div>
      </header>

      {collections.filter((item) => item.featured).slice(0, 2).length > 0 && <section className="directory-collection-strip"><span className="section-kicker">Curated stacks</span>{collections.filter((item) => item.featured).slice(0, 2).map((item) => <Link href={`/collections/${item.slug}`} key={item.slug}><strong>{item.title}</strong><span>{item.description}</span><i>Explore ↗</i></Link>)}</section>}

      <section className="tools-section"><div className="section-heading"><div><span className="section-kicker">Directory</span><h2>Explore the signal</h2></div><span className="issue-line">{tools.length} listed / comparison ready</span></div><ToolExplorer tools={tools} categories={categories} /></section>
    </div>
  );
}
