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
      <section className="hero shell">
        <div className="hero-copy">
          <div className="hero-topline">
            <span className="section-kicker">Independent developer publication</span>
            <span className="hero-status"><i aria-hidden="true" /> Built for people who ship</span>
          </div>
          <h1>Developer news<br/><em>without the noise.</em></h1>
          <div className="hero-bottom">
            <p>RapidReach tracks the shifts that actually change how software gets built: AI, cloud, open source, web engineering, and the tools behind modern teams.</p>
            <div className="hero-actions">
              <Link className="primary-link" href={featured ? `/news/${featured.slug}` : "/#latest"}>Read the lead story <span aria-hidden="true">↗</span></Link>
              <Link className="quiet-link" href="/#latest">Latest coverage ↓</Link>
            </div>
          </div>
        </div>

        <aside className="hero-index" aria-label="RapidReach edition details">
          <div className="index-head"><span>RapidReach / 001</span><span>Signal desk</span></div>
          <div className="index-stat"><strong>{posts.length}</strong><span>stories in the current briefing</span></div>
          <div className="index-stat"><strong>{categories.length}</strong><span>active engineering beats</span></div>
          <p>No infinite feed. No paywall. Just useful context for software builders.</p>
        </aside>
      </section>

      <section className="topic-strip">
        <div className="shell topic-row">
          <span>Explore</span>
          {categories.map((category) => <Link key={category} href={`/category/${encodeURIComponent(category)}`}>{category}</Link>)}
          <Link className="topic-search" href="/search">Search all stories ↗</Link>
        </div>
      </section>

      {featured && (
        <section className="shell featured-section">
          <div className="section-heading">
            <div><span className="section-kicker">Lead story</span><h2>Worth your attention</h2></div>
            <span className="issue-line">Editor’s pick / Latest edition</span>
          </div>
          <article className="featured-story">
            <div className="featured-rail"><span className="featured-number">01</span><span className="featured-label">Lead</span></div>
            <div className="featured-content">
              <div className="eyebrow">
                <Link href={`/category/${encodeURIComponent(featured.category)}`}>{featured.category}</Link>
                <span>•</span>
                <time dateTime={featured.publishedAt}>{new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(new Date(featured.publishedAt))}</time>
              </div>
              <h2><Link href={`/news/${featured.slug}`}>{featured.title}</Link></h2>
              <p>{featured.summary}</p>
              <div className="featured-footer">
                <span>{featured.readingMinutes} min read · By {featured.author}</span>
                <Link className="text-link" href={`/news/${featured.slug}`}>Open story <span aria-hidden="true">↗</span></Link>
              </div>
            </div>
          </article>
        </section>
      )}

      <section className="shell latest-section" id="latest">
        <div className="section-heading">
          <div><span className="section-kicker">The latest</span><h2>What developers should know</h2></div>
          <form action="/search" className="search-inline">
            <input type="search" name="q" placeholder="Search RapidReach" aria-label="Search RapidReach"/>
            <button type="submit">Search ↗</button>
          </form>
        </div>
        <div className="article-grid">{rest.map((post) => <ArticleCard key={post.slug} post={post} />)}</div>
      </section>

      <section className="shell manifesto">
        <div className="manifesto-heading"><span className="section-kicker">The editorial filter</span><span>RapidReach / Why we exist</span></div>
        <blockquote>“The internet does not need another infinite feed. It needs better filters.”</blockquote>
        <div className="manifesto-grid">
          <p><span>01</span><strong>Built for builders.</strong> Coverage starts from how technology changes engineering work, not from how loudly it launched.</p>
          <p><span>02</span><strong>Readable by machines.</strong> Semantic HTML, structured summaries, canonical URLs, JSON-LD, RSS, sitemap data, and a public API.</p>
          <p><span>03</span><strong>Part of the open web.</strong> Articles stay linkable, shareable, searchable, and readable without requiring a social account.</p>
        </div>
      </section>
    </>
  );
}
