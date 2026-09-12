import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ToolUpvote } from "@/components/ToolUpvote";
import { ToolCard } from "@/components/ToolCard";
import { ArticleCard } from "@/components/ArticleCard";
import { PreferenceButton } from "@/components/PreferenceButton";
import { getCategory } from "@/lib/categories";
import { serializeJsonLd } from "@/lib/json-ld";
import { getToolBySlug, getTools } from "@/lib/tools";
import { getPosts } from "@/lib/posts";
import { encodedPathSegment, formatDate, normalizedSiteUrl } from "@/lib/public-format";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);
  if (!tool) return {};
  const screenshots = tool.screenshots || [];
  const images = [tool.logoUrl, ...screenshots].filter(Boolean) as string[];
  const socialImages = images.length ? images : ["/opengraph-image"];
  return {
    title: `${tool.name} — Developer Tool Review`,
    description: tool.verdict || tool.tagline,
    keywords: [...tool.tags, tool.category, "developer tools"],
    alternates: { canonical: `/tools/${tool.slug}` },
    openGraph: { title: `${tool.name} — Developer Tool Review`, description: tool.verdict || tool.tagline, url: `/tools/${tool.slug}`, images: socialImages },
    twitter: { card: "summary_large_image", title: `${tool.name} — Developer Tool Review`, description: tool.verdict || tool.tagline, images: socialImages.slice(0, 1) },
  };
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);
  if (!tool) notFound();
  const [category, allTools, posts] = await Promise.all([getCategory("tool", tool.category), getTools(), getPosts()]);
  const screenshots = tool.screenshots || [];
  const alternativeTools = (tool.alternatives || []).map((item) => allTools.find((candidate) => candidate.slug === item)).filter(Boolean) as typeof allTools;
  const explicitPosts = (tool.relatedPostSlugs || []).map((item) => posts.find((post) => post.slug === item)).filter(Boolean) as typeof posts;
  const relatedPosts = (explicitPosts.length ? explicitPosts : posts.filter((post) => post.tags.some((tag) => tool.tags.some((toolTag) => toolTag.toLowerCase().includes(tag.toLowerCase()) || tag.toLowerCase().includes(toolTag.toLowerCase()))))).slice(0, 3);
  const siteUrl = normalizedSiteUrl();
  const toolPageUrl = `${siteUrl}/tools/${encodedPathSegment(tool.slug)}`;
  const externalUrls = [tool.website, tool.github].filter(Boolean) as string[];
  const free = tool.pricing === "free" || tool.pricing === "open-source";
  const schema = {
    "@type": "SoftwareApplication",
    "@id": `${toolPageUrl}#software`,
    name: tool.name,
    description: tool.description,
    url: toolPageUrl,
    image: [tool.logoUrl, ...screenshots].filter(Boolean),
    applicationCategory: category?.name || tool.category,
    isAccessibleForFree: free,
    offers: free
      ? { "@type": "Offer", price: "0", priceCurrency: "USD", url: tool.website, availability: "https://schema.org/InStock" }
      : { "@type": "Offer", url: tool.website, availability: "https://schema.org/InStock" },
    author: tool.maker ? { "@type": "Organization", name: tool.maker } : undefined,
    sameAs: externalUrls,
    mainEntityOfPage: { "@type": "WebPage", "@id": toolPageUrl },
    inLanguage: "en",
    keywords: tool.tags.join(", "),
  };
  const breadcrumbSchema = {
    "@type": "BreadcrumbList",
    "@id": `${toolPageUrl}#breadcrumbs`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "RapidReach", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Developer Tools", item: `${siteUrl}/tools` },
      ...(category ? [{ "@type": "ListItem", position: 3, name: category.name, item: `${siteUrl}/tools/category/${encodedPathSegment(category.slug)}` }] : []),
      { "@type": "ListItem", position: category ? 4 : 3, name: tool.name, item: toolPageUrl },
    ],
  };
  const structuredData = { "@context": "https://schema.org", "@graph": [schema, breadcrumbSchema] };
  return (
    <article className="tool-detail-page shell">
      <header className="tool-detail-hero">
        <div className="tool-detail-logo">{tool.logoUrl ? <img src={tool.logoUrl} alt={`${tool.name} logo`} /> : <span>{tool.name.slice(0,1).toUpperCase()}</span>}</div>
        <div className="tool-detail-copy">
          <div className="eyebrow">{category && <Link href={`/tools/category/${category.slug}`}>{category.name}</Link>}<span>•</span><span>{tool.pricing === "open-source" ? "Open source" : tool.pricing}</span>{tool.featured && <><span>•</span><span>Editors’ pick</span></>}</div>
          <h1>{tool.name}</h1>
          <p className="tool-tagline">{tool.tagline}</p>
          <div className="tool-detail-actions"><a className="cms-primary" href={tool.website} target="_blank" rel="noreferrer">Visit website ↗</a>{tool.github && <a className="cms-secondary" href={tool.github} target="_blank" rel="noreferrer">GitHub ↗</a>}<PreferenceButton kind="tool" value={tool.slug} label="Save tool" savedLabel="Saved ✓" /><ToolUpvote slug={tool.slug} initialUpvotes={tool.upvotes} large /></div>
        </div>
      </header>

      {tool.verdict && <section className="rapidreach-verdict"><div><span className="section-kicker">RapidReach verdict</span><h2>The short version</h2></div><p>{tool.verdict}</p></section>}

      {screenshots.length > 0 && <section className="tool-gallery" aria-label={`${tool.name} screenshots`}><div className="tool-gallery-head"><span className="section-kicker">Product gallery</span><span>{screenshots.length} screenshot{screenshots.length === 1 ? "" : "s"}</span></div><div className="tool-gallery-track">{screenshots.map((screenshot, index) => <a href={screenshot} target="_blank" rel="noreferrer" key={`${screenshot}-${index}`}><img src={screenshot} alt={`${tool.name} product screenshot ${index + 1}`} loading={index === 0 ? "eager" : "lazy"} /></a>)}</div></section>}

      <div className="tool-detail-grid">
        <section className="tool-explanation"><span className="section-kicker">What it does</span><h2>Why developers use {tool.name}</h2>{tool.description.split("\n\n").map((paragraph, index) => <p key={index}>{paragraph}</p>)}</section>
        <aside className="tool-facts"><div><span>Maker</span><strong>{tool.maker || "Not specified"}</strong></div><div><span>Pricing</span><strong>{tool.pricing}</strong></div><div><span>Open source</span><strong>{tool.openSource ? "Yes" : "No"}</strong></div><div><span>Launched</span><strong>{formatDate(tool.launchedAt, { dateStyle: "medium" })}</strong></div><div><span>Tags</span><p>{tool.tags.join(" · ")}</p></div></aside>
      </div>

      <section className="decision-grid">
        <div><span className="section-kicker">Best for</span><ul>{(tool.bestFor?.length ? tool.bestFor : ["Teams evaluating this category and wanting a focused implementation fit."]).map((item) => <li key={item}>{item}</li>)}</ul></div>
        <div><span className="section-kicker">Not ideal for</span><ul>{(tool.notIdealFor?.length ? tool.notIdealFor : ["Teams whose constraints do not match the product’s core deployment or workflow model."]).map((item) => <li key={item}>{item}</li>)}</ul></div>
        <div><span className="section-kicker">Strengths</span><ul>{(tool.strengths || []).map((item) => <li key={item}>{item}</li>)}</ul></div>
        <div><span className="section-kicker">Trade-offs</span><ul>{(tool.tradeoffs || []).map((item) => <li key={item}>{item}</li>)}</ul></div>
      </section>

      {alternativeTools.length > 0 && <section className="tool-related-section"><div className="section-heading"><div><span className="section-kicker">Alternatives</span><h2>Compare before you commit</h2></div></div><div className="tool-list">{alternativeTools.map((item) => <ToolCard key={item.slug} tool={item} />)}</div><div className="comparison-links">{alternativeTools.slice(0,3).map((item) => <Link key={item.slug} href={`/compare/${tool.slug}-vs-${item.slug}`}>{tool.name} vs {item.name} ↗</Link>)}</div></section>}

      {relatedPosts.length > 0 && <section className="related-section"><div className="section-heading"><div><span className="section-kicker">Related intelligence</span><h2>Read the context around {tool.name}</h2></div></div><div className="related-grid">{relatedPosts.map((post) => <ArticleCard key={post.slug} post={post} compact />)}</div></section>}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }} />
    </article>
  );
}
