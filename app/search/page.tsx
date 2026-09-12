import { ArticleCard } from "@/components/ArticleCard";
import { getPosts } from "@/lib/posts";

const MAX_QUERY_LENGTH = 200;

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const { q } = await searchParams;
  const rawQuery = Array.isArray(q) ? q[0] || "" : q || "";
  const displayQuery = rawQuery.trim().slice(0, MAX_QUERY_LENGTH);
  const query = displayQuery.toLowerCase();
  const posts = await getPosts();
  const results = query
    ? posts.filter((post) => [post.title, post.summary, post.content, post.category, ...post.tags].join(" ").toLowerCase().includes(query))
    : posts;

  return <section className="shell archive-page"><header className="archive-header"><span className="section-kicker">Search</span><h1>{query ? `Results for “${displayQuery}”` : "Find a story"}</h1><form action="/search" className="search-large"><input autoFocus type="search" name="q" maxLength={MAX_QUERY_LENGTH} defaultValue={displayQuery} placeholder="AI agents, Kubernetes, Next.js…" aria-label="Search stories"/><button type="submit">Search</button></form></header><div className="article-grid">{results.map((post) => <ArticleCard key={post.slug} post={post}/>)}</div>{results.length === 0 && <p className="empty-state">Nothing matched that search yet.</p>}</section>;
}
