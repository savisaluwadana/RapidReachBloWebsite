import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ToolUpvote } from "@/components/ToolUpvote";
import { getCategory } from "@/lib/categories";
import { getToolBySlug } from "@/lib/tools";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rapidreach.dev";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);
  if (!tool) return {};
  const screenshots = tool.screenshots || [];
  const images = [tool.logoUrl, ...screenshots].filter(Boolean) as string[];
  return {
    title: `${tool.name} — Developer Tool`,
    description: tool.tagline,
    alternates: { canonical: `/tools/${tool.slug}` },
    openGraph: { title: tool.name, description: tool.tagline, url: `/tools/${tool.slug}`, images },
    twitter: { card: "summary_large_image", title: tool.name, description: tool.tagline, images: images.slice(0, 1) },
  };
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);
  if (!tool) notFound();
  const category = await getCategory("tool", tool.category);
  const screenshots = tool.screenshots || [];
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.description,
    url: tool.website,
    image: [tool.logoUrl, ...screenshots].filter(Boolean),
    applicationCategory: category?.name || tool.category,
    offers: { "@type": "Offer", price: tool.pricing === "free" || tool.pricing === "open-source" ? "0" : undefined, priceCurrency: "USD" },
    author: tool.maker ? { "@type": "Organization", name: tool.maker } : undefined,
    sameAs: tool.github ? [tool.github] : undefined,
    mainEntityOfPage: `${siteUrl}/tools/${tool.slug}`,
  };
  return (
    <article className="tool-detail-page shell">
      <header className="tool-detail-hero">
        <div className="tool-detail-logo">{tool.logoUrl ? <img src={tool.logoUrl} alt={`${tool.name} logo`} /> : <span>{tool.name.slice(0,1).toUpperCase()}</span>}</div>
        <div className="tool-detail-copy">
          <div className="eyebrow">{category && <Link href={`/tools/category/${category.slug}`}>{category.name}</Link>}<span>•</span><span>{tool.pricing === "open-source" ? "Open source" : tool.pricing}</span></div>
          <h1>{tool.name}</h1>
          <p className="tool-tagline">{tool.tagline}</p>
          <div className="tool-detail-actions"><a className="cms-primary" href={tool.website} target="_blank" rel="noreferrer">Visit website ↗</a>{tool.github && <a className="cms-secondary" href={tool.github} target="_blank" rel="noreferrer">GitHub ↗</a>}<ToolUpvote slug={tool.slug} initialUpvotes={tool.upvotes} large /></div>
        </div>
      </header>

      {screenshots.length > 0 && (
        <section className="tool-gallery" aria-label={`${tool.name} screenshots`}>
          <div className="tool-gallery-head"><span className="section-kicker">Product gallery</span><span>{screenshots.length} screenshot{screenshots.length === 1 ? "" : "s"}</span></div>
          <div className="tool-gallery-track">
            {screenshots.map((screenshot, index) => (
              <a href={screenshot} target="_blank" rel="noreferrer" key={`${screenshot}-${index}`}>
                <img src={screenshot} alt={`${tool.name} product screenshot ${index + 1}`} loading={index === 0 ? "eager" : "lazy"} />
              </a>
            ))}
          </div>
        </section>
      )}

      <div className="tool-detail-grid">
        <section className="tool-explanation"><span className="section-kicker">What it does</span><h2>Why developers use {tool.name}</h2>{tool.description.split("\n\n").map((paragraph, index) => <p key={index}>{paragraph}</p>)}</section>
        <aside className="tool-facts"><div><span>Maker</span><strong>{tool.maker || "Not specified"}</strong></div><div><span>Pricing</span><strong>{tool.pricing}</strong></div><div><span>Open source</span><strong>{tool.openSource ? "Yes" : "No"}</strong></div><div><span>Launched</span><strong>{new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(tool.launchedAt))}</strong></div><div><span>Tags</span><p>{tool.tags.join(" · ")}</p></div></aside>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </article>
  );
}
