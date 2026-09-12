import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCard } from "@/components/ArticleCard";
import { SignalDesk } from "@/components/SignalDesk";
import { ToolCard } from "@/components/ToolCard";
import { getCategories, getPosts } from "@/lib/posts";
import { formatDate, isoDate } from "@/lib/public-format";
import { getTools } from "@/lib/tools";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Developer Intelligence for AI, Cloud Native & Developer Tools",
  description: "Independent developer intelligence covering AI engineering, developer tools, cloud-native infrastructure, open source, platform engineering, and the workflows changing how software gets built.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "RapidReach — Developer Intelligence",
    description: "Know what changed. Know what matters across AI engineering, developer tools, cloud native, open source, and software building.",
    url: "/",
  },
  twitter: {
    title: "RapidReach — Developer Intelligence",
    description: "Know what changed. Know what matters across the developer ecosystem.",
  },
};

export default async function Home() {
  const [posts, categories, tools] = await Promise.all([getPosts(), getCategories(), getTools()]);
  const signalLead = posts[0];
  const deepDive = posts.find((post, index) => index > 0 && post.readingMinutes >= 6) || posts[1] || signalLead;
  const deepDivePublishedIso = deepDive ? isoDate(deepDive.publishedAt) : undefined;
  const archivePosts = posts.filter((post) => post.slug !== signalLead?.slug && post.slug !== deepDive?.slug).slice(0, 9);
  const toolWatch = tools.find((tool) => tool.featured) || tools[0];

  return (
    <>
      <section className="hero shell">
        <div className="hero-copy">
          <div className="hero-topline"><span className="section-kicker">Independent developer intelligence</span><span className="hero-status"><i aria-hidden="true" /> Signal for people who build</span></div>
          <h1>Know what changed.<br/><em>Know what matters.</em></h1>
          <div className="hero-bottom"><p>RapidReach tracks AI engineering, developer tools, cloud-native infrastructure, open source, and the workflows changing how software gets built — then turns the noise into useful context.</p><div className="hero-actions"><Link className="primary-link" href="/signals">Open Signal Desk <span aria-hidden="true">↗</span></Link><Link className="quiet-link" href="/briefing">Read the briefing →</Link></div></div>
        </div>
        <aside className="hero-index" aria-label="RapidReach intelligence index"><div className="index-head"><span>RapidReach / Intelligence</span><span>Signal desk</span></div><div className="index-stat"><strong>{posts.length}</strong><span>published signals and analysis pieces</span></div><div className="index-stat"><strong>{tools.length}</strong><span>developer tools tracked in discovery</span></div><p>Fast signal when something moves. Deeper analysis when it deserves your time.</p></aside>
      </section>

      <section className="brand-proof-strip" aria-label="RapidReach editorial formats"><div className="shell brand-proof-row"><span>Follow the signal</span><Link href="/signals">Signal Desk <span>Live</span></Link><Link href="/briefing">RapidReach Brief <span>Briefing</span></Link><Link href="/tools">Tool Watch <span>Directory</span></Link><Link href="/collections">Builder Stacks <span>Curated</span></Link></div></section>

      <section className="topic-strip" id="topics"><div className="shell topic-row"><span>Intelligence beats</span>{categories.map((category) => <Link key={category} href={`/category/${encodeURIComponent(category)}`}>{category}</Link>)}<Link className="topic-search" href="/about">How RapidReach works ↗</Link></div></section>

      <SignalDesk posts={posts} />

      <section className="brand-formats shell" aria-labelledby="formats-title">
        <div className="brand-formats-head"><div><span className="section-kicker">Recurring franchises</span><h2 id="formats-title">A reason to come back.</h2></div><p>RapidReach is organized around recognizable formats instead of an endless generic feed. Each one answers a different question for builders.</p></div>
        <div className="brand-format-grid">
          <article className="brand-format-card"><span>01 / Daily signal</span><h3>Signal Desk</h3><p>The dense view of what is moving across developer technology, with the important story surfaced first.</p><Link href="/signals">Open the desk →</Link></article>
          <article className="brand-format-card"><span>02 / Briefing</span><h3>RapidReach Brief</h3><p>The small set of stories worth carrying into your day or week, with context instead of headline volume.</p><Link href="/briefing">Read the brief →</Link></article>
          <article className="brand-format-card"><span>03 / Discovery</span><h3>Tool Watch</h3><p>Developer products evaluated with practical context, comparisons, pricing signals, and editorial judgment.</p><Link href="/tools">Explore tools →</Link></article>
          <article className="brand-format-card"><span>04 / Workflow</span><h3>Builder Stacks</h3><p>Curated combinations of tools and patterns for real engineering jobs, workflows, and platform problems.</p><Link href="/collections">Explore stacks →</Link></article>
        </div>
      </section>

      {deepDive && <section className="shell featured-section"><div className="section-heading"><div><span className="section-kicker">RapidReach Deep Dive</span><h2>Worth the extra context.</h2></div><span className="issue-line">Analysis / Editor’s pick</span></div><article className="featured-story"><div className="featured-rail"><span className="featured-number">01</span><span className="featured-label">Deep dive</span></div><div className="featured-content"><div className="eyebrow"><Link href={`/category/${encodeURIComponent(deepDive.category)}`}>{deepDive.category}</Link><span>•</span><time dateTime={deepDivePublishedIso}>{formatDate(deepDive.publishedAt, { month: "long", day: "numeric", year: "numeric" })}</time></div><h2><Link href={`/news/${deepDive.slug}`}>{deepDive.title}</Link></h2><p>{deepDive.summary}</p><div className="featured-footer"><span>{deepDive.readingMinutes} min read · By {deepDive.author}</span><Link className="text-link" href={`/news/${deepDive.slug}`}>Open analysis <span aria-hidden="true">↗</span></Link></div></div></article></section>}

      <section className="shell latest-section" id="latest"><div className="section-heading"><div><span className="section-kicker">The briefing archive</span><h2>What builders should know.</h2></div><form action="/search" className="search-inline"><input type="search" name="q" placeholder="Search RapidReach" aria-label="Search RapidReach"/><button type="submit">Search ↗</button></form></div><div className="article-grid">{archivePosts.map((post) => <ArticleCard key={post.slug} post={post} />)}</div></section>

      {toolWatch && <section className="shell brand-tool-watch"><div className="brand-tool-watch-head"><div><span className="section-kicker">RapidReach Tool Watch</span><h2>A tool worth understanding.</h2></div><Link className="quiet-link" href="/tools">Explore all tools ↗</Link></div><div className="tool-list"><ToolCard tool={toolWatch} />{tools.filter((tool) => tool.slug !== toolWatch.slug).slice(0,3).map((tool) => <ToolCard key={tool.slug} tool={tool}/>)}</div></section>}

      <section className="shell manifesto"><div className="manifesto-heading"><span className="section-kicker">The RapidReach filter</span><span>Editorial principle / 001</span></div><blockquote>“The internet does not need another infinite feed. It needs better filters.”</blockquote><div className="manifesto-grid"><p><span>01</span><strong>Signal before volume.</strong> We prioritize developments that change engineering decisions, workflows, or the tools builders depend on.</p><p><span>02</span><strong>Context before hype.</strong> A launch is not interesting because it launched. It is interesting when it changes what a builder can actually do.</p><p><span>03</span><strong>Useful to humans and agents.</strong> Structured reporting, transparent sources, APIs, metadata, and portable content keep the publication usable beyond the page.</p></div></section>
    </>
  );
}
