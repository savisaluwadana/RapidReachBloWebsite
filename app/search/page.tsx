import { ArticleCard } from "@/components/ArticleCard";
import { getPosts } from "@/lib/posts";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams; const query = q.trim().toLowerCase(); const posts = await getPosts(); const results = query ? posts.filter((post) => [post.title, post.summary, post.content, post.category, ...post.tags].join(" ").toLowerCase().includes(query)) : posts;
  return <section className="shell archive-page"><header className="archive-header"><span className="section-kicker">Search</span><h1>{query ? `Results for “${q}”` : "Find a story"}</h1><form action="/search" className="search-large"><input autoFocus type="search" name="q" defaultValue={q} placeholder="AI agents, Kubernetes, Next.js…" aria-label="Search stories"/><button type="submit">Search</button></form></header><div className="article-grid">{results.map((post) => <ArticleCard key={post.slug} post={post}/>)}</div>{results.length === 0 && <p className="empty-state">Nothing matched that search yet.</p>}</section>;
}
