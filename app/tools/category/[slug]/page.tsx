import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ToolCard } from "@/components/ToolCard";
import { getCategory, getCategoriesByKind } from "@/lib/categories";
import { getTools } from "@/lib/tools";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory("tool", slug);
  if (!category) return { title: "Tool category not found", robots: { index: false, follow: false } };
  const description = category.description || `Discover ${category.name} developer tools.`;
  const url = `/tools/category/${category.slug}`;
  return {
    title: `${category.name} Developer Tools`,
    description,
    alternates: { canonical: url },
    openGraph: { title: `${category.name} Developer Tools | RapidReach`, description, url, type: "website" },
    twitter: { card: "summary_large_image", title: `${category.name} Developer Tools | RapidReach`, description },
  };
}

export default async function ToolCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [category, tools, categories] = await Promise.all([getCategory("tool", slug), getTools({ category: slug }), getCategoriesByKind("tool")]);
  if (!category) notFound();
  return <div className="tools-page shell"><header className="tools-hero compact"><span className="section-kicker">Tool category</span><h1>{category.name}</h1><p>{category.description || `Developer products in ${category.name}.`}</p><div className="tools-category-strip"><Link href="/tools">All tools</Link>{categories.map((item) => <Link className={item.slug === slug ? "active" : ""} key={item.slug} href={`/tools/category/${item.slug}`}>{item.name}</Link>)}</div></header><section className="tools-section"><div className="section-heading"><div><span className="section-kicker">Directory</span><h2>{tools.length} tool{tools.length === 1 ? "" : "s"}</h2></div></div><div className="tool-list">{tools.map((tool) => <ToolCard key={tool.slug} tool={tool}/>)}</div></section></div>;
}
