import Link from "next/link";
import { ArticleCard } from "@/components/ArticleCard";
import { ToolCard } from "@/components/ToolCard";
import { getCategories, getPosts } from "@/lib/posts";
import { getTools } from "@/lib/tools";

export const revalidate = 60;

export default async function Home() {
  const [posts, categories, tools] = await Promise.all([getPosts(), getCategories(), getTools()]);
  const [featured, ...rest] = posts;

  return (
    <>
      <section className="hero shell">
        <div className="hero-copy">
          <div className="hero-topline"><span className="section-kicker">Independent developer publication</span><span className="hero-status"><i aria-hidden="true" /> Built for people who ship</span></div>
          <h1>Developer news<br/><em>without the noise.</em></h1>
          <div className="hero-bottom"><p>RapidReach tracks the shifts that change how software gets built, then helps you discover the developer tools behind those shifts.</p><div className="hero-actions"><Link className="primary-link" href={featured ? `/news/${featured.slug}` : "/#latest"}>Read the lead story <span aria-hidden="true">↗</span></Link><Link className="quiet-link" href="/tools">Discover tools →</Link></div></div>
        </div>
        <aside className="hero-index" aria-label="RapidReach edition details"><div className="index-head"><span>RapidReach / 001</span><span>Signal desk</span></div><div className="index-stat"><strong>{posts.length}</strong><span>stories in the current briefing</span></div><div className="index-stat"><strong>{tools.length}</strong><span>developer tools in discovery</span></div><p>No infinite feed. No paywall. Useful context and curated software for builders.</p></aside>
      </section>

      <section className="topic-strip" id="topics"><div className="shell topic-row"><span>News topics</span>{categories.map((category) => <Link key={category} href={`/category/${encodeURIComponent(category)}`}>{category}</Link>)}<Link className="topic-search" href="/tools">Browse developer tools ↗</Link></div></section>

      {featured && <section className="shell featured-section"><div className="section-heading"><div><span className="section-kicker">Lead story</span><h2>Worth your attention</h2></div><span className="issue-line">Editor’s pick / Latest edition</span></div><article className="featured-story"><div className="featured-rail"><span className="featured-number">01</span><span className="featured-label">Lead</span></div><div className="featured-content"><div className="eyebrow"><Link href={`/category/${encodeURIComponent(featured.category)}`}>{featured.category}</Link><span>•</span><time dateTime={featured.publishedAt}>{new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(new Date(featured.publishedAt))}</time></div><h2><Link href={`/news/${featured.slug}`}>{featured.title}</Link></h2><p>{featured.summary}</p><div className="featured-footer"><span>{featured.readingMinutes} min read · By {featured.author}</span><Link className="text-link" href={`/news/${featured.slug}`}>Open story <span aria-hidden="true">↗</span></Link></div></div></article></section>}

      <section className="shell latest-section" id="latest"><div className="section-heading"><div><span className="section-kicker">The latest</span><h2>What developers should know</h2></div><form action="/search" className="search-inline"><input type="search" name="q" placeholder="Search RapidReach" aria-label="Search RapidReach"/><button type="submit">Search ↗</button></form></div><div className="article-grid">{rest.map((post) => <ArticleCard key={post.slug} post={post} />)}</div></section>

      <section className="shell home-tools"><div className="home-tools-intro"><div><span className="section-kicker">Developer tool discovery</span><h2>Tools worth knowing about.</h2></div><p>Product Hunt-style discovery, but focused on developer usefulness: what a tool does, who it is for, pricing, open-source status, and the links that matter.</p></div><div className="tool-list">{tools.slice(0,4).map((tool) => <ToolCard key={tool.slug} tool={tool}/>)}</div><div className="home-tools-footer"><Link href="/tools">Explore the full tools directory ↗</Link></div></section>

      <section className="shell manifesto"><div className="manifesto-heading"><span className="section-kicker">The editorial filter</span><span>RapidReach / Why we exist</span></div><blockquote>“The internet does not need another infinite feed. It needs better filters.”</blockquote><div className="manifesto-grid"><p><span>01</span><strong>Built for builders.</strong> Coverage starts from how technology changes engineering work, not from how loudly it launched.</p><p><span>02</span><strong>Discovery with context.</strong> Tool listings explain the product before sending you somewhere else to evaluate it.</p><p><span>03</span><strong>Readable by machines.</strong> Semantic HTML, structured summaries, JSON-LD, APIs, llms.txt, and sitemap data keep RapidReach useful to people and agents.</p></div></section>
    </>
  );
}
