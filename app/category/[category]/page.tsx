import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/ArticleCard";
import { getCategories, getPosts } from "@/lib/posts";

function categoryKey(value: string) {
  let decoded = String(value || "").trim().slice(0, 120);
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    // Keep the original value when a malformed escape sequence is supplied.
  }

  return decoded
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function resolveCategory(value: string) {
  const key = categoryKey(value);
  if (!key) return null;

  const [managedCategories, posts] = await Promise.all([getCategories(), getPosts()]);
  const labels = [...new Set([...managedCategories, ...posts.map((post) => post.category)].filter(Boolean))];

  return labels.find((category) => categoryKey(category) === key) || null;
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const label = await resolveCategory(category);
  if (!label) return { title: "Topic not found", robots: { index: false, follow: false } };
  const description = `Reporting and analysis from RapidReach’s ${label} desk.`;
  const url = `/category/${categoryKey(label)}`;
  return {
    title: `${label} News & Analysis`,
    description,
    alternates: { canonical: url },
    openGraph: { title: `${label} News & Analysis | RapidReach`, description, url, type: "website" },
    twitter: { card: "summary_large_image", title: `${label} News & Analysis | RapidReach`, description },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const label = await resolveCategory(category);
  if (!label) notFound();
  const posts = (await getPosts()).filter((post) => categoryKey(post.category) === categoryKey(label));
  return <section className="shell archive-page"><header className="archive-header"><span className="section-kicker">Topic</span><h1>{label}</h1><p>Reporting and analysis from RapidReach’s {label} desk.</p></header><div className="article-grid">{posts.map((post) => <ArticleCard key={post.slug} post={post}/>)}</div>{posts.length === 0 && <p className="empty-state">No published stories in this topic yet.</p>}</section>;
}
