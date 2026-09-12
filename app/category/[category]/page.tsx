import { ArticleCard } from "@/components/ArticleCard";
import { getPosts } from "@/lib/posts";

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const label = String(category || "").trim().slice(0, 120);
  const posts = (await getPosts()).filter((post) => post.category.toLowerCase() === label.toLowerCase());
  return <section className="shell archive-page"><header className="archive-header"><span className="section-kicker">Topic</span><h1>{label}</h1><p>Reporting and analysis from RapidReach’s {label} desk.</p></header><div className="article-grid">{posts.map((post) => <ArticleCard key={post.slug} post={post}/>)}</div>{posts.length === 0 && <p className="empty-state">No published stories in this topic yet.</p>}</section>;
}
