import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCard } from "@/components/ArticleCard";
import { SignalDesk } from "@/components/SignalDesk";
import { getCategories, getPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Signal Desk",
  description: "The RapidReach Signal Desk: fast-moving developer intelligence across AI engineering, developer tools, cloud-native infrastructure, open source, and software delivery.",
  alternates: { canonical: "/signals" },
};

export const revalidate = 60;

export default async function SignalsPage() {
  const [posts, categories] = await Promise.all([getPosts(), getCategories()]);
  const archive = posts.slice(7);

  return (
    <>
      <section className="archive-page shell">
        <header className="archive-header">
          <span className="section-kicker">RapidReach / Live intelligence</span>
          <h1>Signal Desk.</h1>
          <p>Fast-moving developer news with the important story surfaced first. RapidReach filters for changes that can alter engineering decisions, workflows, infrastructure, or the tools builders rely on.</p>
          <div className="hero-actions"><Link className="primary-link" href="#signal-desk">Open today’s signals <span aria-hidden="true">↓</span></Link><Link className="quiet-link" href="/briefing">Read the RapidReach Brief →</Link></div>
        </header>
      </section>

      <section className="topic-strip"><div className="shell topic-row"><span>Signal beats</span>{categories.map((category) => <Link key={category} href={`/category/${encodeURIComponent(category)}`}>{category}</Link>)}<Link className="topic-search" href="/search">Search all intelligence ↗</Link></div></section>

      <SignalDesk posts={posts} fullPage />

      <section className="shell latest-section" aria-labelledby="older-signals-title">
        <div className="section-heading"><div><span className="section-kicker">Signal archive</span><h2 id="older-signals-title">Earlier intelligence.</h2></div><Link className="quiet-link" href="/briefing">Switch to curated briefing →</Link></div>
        {archive.length > 0 ? <div className="article-grid">{archive.map((post) => <ArticleCard key={post.slug} post={post} />)}</div> : <p className="empty-state">Older signals will appear here as the desk publishes more stories.</p>}
      </section>
    </>
  );
}
