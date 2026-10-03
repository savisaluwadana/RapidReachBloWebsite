import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCard } from "@/components/ArticleCard";
import { ToolCard } from "@/components/ToolCard";
import { getCollections } from "@/lib/collections";
import { searchPosts } from "@/lib/posts";
import { getTools } from "@/lib/tools";

const MAX_QUERY_LENGTH = 200;

export const metadata: Metadata = {
  title: "Search",
  description: "Search RapidReach developer intelligence, tools, collections, analysis, and reporting.",
  alternates: { canonical: "/search" },
  robots: { index: false, follow: true },
};

function matches(query: string, values: Array<string | undefined>) {
  if (!query) return true;
  const haystack = values.filter(Boolean).join(" ").toLowerCase();
  return haystack.includes(query.toLowerCase());
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const { q } = await searchParams;
  const rawQuery = Array.isArray(q) ? q[0] || "" : q || "";
  const displayQuery = rawQuery.trim().slice(0, MAX_QUERY_LENGTH);

  const [posts, allTools, allCollections] = await Promise.all([
    searchPosts(displayQuery, 50),
    getTools(),
    getCollections(),
  ]);

  const tools = allTools
    .filter((tool) => matches(displayQuery, [tool.name, tool.tagline, tool.description, tool.maker, tool.category, ...tool.tags]))
    .slice(0, 24);
  const collections = allCollections
    .filter((collection) => matches(displayQuery, [collection.title, collection.description]))
    .slice(0, 12);
  const total = posts.length + tools.length + collections.length;

  return (
    <section className="shell archive-page">
      <header className="archive-header">
        <span className="section-kicker">Search RapidReach</span>
        <h1>{displayQuery ? `Results for “${displayQuery}”` : "Find developer intelligence"}</h1>
        <p>Search stories, developer tools, and curated engineering collections from one place.</p>
        <form action="/search" className="search-large">
          <input autoFocus type="search" name="q" maxLength={MAX_QUERY_LENGTH} defaultValue={displayQuery} placeholder="AI agents, Kubernetes, observability…" aria-label="Search RapidReach" />
          <button type="submit">Search</button>
        </form>
      </header>

      {posts.length > 0 && (
        <section className="related-section" aria-labelledby="search-stories">
          <div className="section-heading"><div><span className="section-kicker">Stories</span><h2 id="search-stories">Reporting and analysis</h2></div><span>{posts.length} results</span></div>
          <div className="article-grid">{posts.map((post) => <ArticleCard key={post.slug} post={post} />)}</div>
        </section>
      )}

      {tools.length > 0 && (
        <section className="tools-section" aria-labelledby="search-tools">
          <div className="section-heading"><div><span className="section-kicker">Tools</span><h2 id="search-tools">Developer software</h2></div><span>{tools.length} results</span></div>
          <div className="tool-list">{tools.map((tool) => <ToolCard key={tool.slug} tool={tool} />)}</div>
        </section>
      )}

      {collections.length > 0 && (
        <section className="related-section" aria-labelledby="search-collections">
          <div className="section-heading"><div><span className="section-kicker">Collections</span><h2 id="search-collections">Curated stacks</h2></div><span>{collections.length} results</span></div>
          <div className="collection-grid">
            {collections.map((collection) => (
              <Link className="collection-card" href={`/collections/${collection.slug}`} key={collection.slug}>
                <span>{collection.featured ? "Editor’s collection" : "Collection"}</span>
                <h3>{collection.title}</h3>
                <p>{collection.description}</p>
                <footer><strong>Explore ↗</strong></footer>
              </Link>
            ))}
          </div>
        </section>
      )}

      {total === 0 && <p className="empty-state">Nothing matched that search yet.</p>}
    </section>
  );
}
