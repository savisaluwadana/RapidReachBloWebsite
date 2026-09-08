import Link from "next/link";
import { ArticleCard } from "@/components/ArticleCard";
import { getCategories, getPosts } from "@/lib/posts";

export const revalidate = 60;

export default async function Home() {
  const posts = await getPosts();
  const categories = await getCategories();
  const [featured, ...rest] = posts;

  return (
    <>
      <section className="hero shell"><div className="hero-copy"><span className="section-kicker">Independent developer publication</span><h1>Developer news<br/><em>without the noise.</em></h1><p>RapidReach tracks the shifts that actually change how software gets built: AI, cloud, open source, web engineering, and the tools behind modern teams.</p></div><div className="hero-note"><span>Signal over volume</span><p>Shorter feeds. Deeper context. Direct links to the ideas worth understanding.</p></div></section>
      <section className="topic-strip"><div className="shell topic-row"><span>Explore</span>{categories.map((category) => <Link key={category} href={`/category/${encodeURIComponent(category)}`}>{category}</Link>)}</div></section>
      {featured && <section className="shell featured-section"><div className="section-heading"><span className="section-kicker">Lead story</span><span className="issue-line">Latest edition</span></div><article className="featured-story"><div className="featured-number">01</div><div className="featured-content"><div className="eyebrow"><Link href={`/category/${encodeURIComponent(featured.category)}`}>{featured.category}</Link><span>•</span><time dateTime={featured.publishedAt}>{new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(new Date(featured.publishedAt))}</time></div><h2><Link href={`/news/${featured.slug}`}>{featured.title}</Link></h2><p>{featured.summary}</p><div className="featured-footer"><span>{featured.readingMinutes} min read</span><Link className="text-link" href={`/news/${featured.slug}`}>Read analysis →</Link></div></div></article></section>}
      <section className="shell latest-section"><div className="section-heading"><div><span className="section-kicker">The latest</span><h2>What developers should know</h2></div><form action="/search" className="search-inline"><input type="search" name="q" placeholder="Search RapidReach" aria-label="Search RapidReach"/><button type="submit">Search</button></form></div><div className="article-grid">{rest.map((post) => <ArticleCard key={post.slug} post={post} />)}</div></section>
      <section className="shell manifesto"><span className="section-kicker">Why RapidReach</span><blockquote>“The internet does not need another infinite feed. It needs better filters.”</blockquote><div className="manifesto-grid"><p><strong>For builders.</strong> Coverage starts from how a technology changes engineering work, not from how loudly it launched.</p><p><strong>For search and agents.</strong> Every story is semantic HTML with structured summaries, canonical URLs, JSON-LD, RSS, sitemap data, and a readable API.</p><p><strong>For the open web.</strong> Articles are linkable, shareable, and discussion-first without requiring a social account to read them.</p></div></section>
    </>
  );
}
