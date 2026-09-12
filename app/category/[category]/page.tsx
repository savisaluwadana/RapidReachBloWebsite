import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/ArticleCard";
import { getCategories, getPosts } from "@/lib/posts";

async function resolveCategory(value: string) {
  const label = String(value || "").trim().slice(0, 120);
  const categories = await getCategories();
  return categories.find((category) => category.toLowerCase() === label.toLowerCase()) || null;
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const label = await resolveCategory(category);
  if (!label) return { title: "Topic not found", robots: { index: false, follow: false } };
  return {
    title: `${label} News & Analysis`,
    description: `Reporting and analysis from RapidReach’s ${label} desk.`,
    alternates: { canonical: `/category/${encodeURIComponent(label)}` },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const label = await resolveCategory(category);
  if (!label) notFound();
  const posts = (await getPosts()).filter((post) => post.category.toLowerCase() === label.toLowerCase());
  return <section className="shell archive-page"><header className="archive-header"><span className="section-kicker">Topic</span><h1>{label}</h1><p>Reporting and analysis from RapidReach’s {label} desk.</p></header><div className="article-grid">{posts.map((post) => <ArticleCard key={post.slug} post={post}/>)}</div>{posts.length === 0 && <p className="empty-state">No published stories in this topic yet.</p>}</section>;
}
