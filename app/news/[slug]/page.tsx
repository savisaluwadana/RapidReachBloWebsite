import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/ArticleCard";
import { ArticleContent } from "@/components/ArticleContent";
import layoutStyles from "@/components/ArticlePageLayout.module.css";
import { ToolCard } from "@/components/ToolCard";
import { Engagement } from "@/components/Engagement";
import { PreferenceButton } from "@/components/PreferenceButton";
import { getAuthorProfile } from "@/lib/authors";
import { serializeJsonLd } from "@/lib/json-ld";
import { getPostBySlug, getPosts } from "@/lib/posts";
import { relatedPostsFor } from "@/lib/recommendations";
import { getTools } from "@/lib/tools";
import { encodedPathSegment, formatDate, isoDate, normalizedSiteUrl } from "@/lib/public-format";

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  const images = post.featuredImageUrl ? [post.featuredImageUrl] : ["/opengraph-image"];
  const publishedTime = isoDate(post.publishedAt);
  const modifiedTime = isoDate(post.updatedAt) || publishedTime;
  const author = getAuthorProfile(post.author);
  return {
    title: post.title,
    description: post.summary,
    keywords: post.tags,
    authors: [{ name: post.author, url: `/authors/${author.slug}` }],
    category: post.category,
    alternates: {
      canonical: `/news/${post.slug}`,
      types: { "text/markdown": `/news/${post.slug}/markdown` },
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.summary,
      publishedTime,
      modifiedTime,
      authors: [post.author],
      section: post.category,
      tags: post.tags,
      url: `/news/${post.slug}`,
      images,
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.summary, images },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  const [allPosts, tools] = await Promise.all([getPosts(), getTools()]);
  const related = relatedPostsFor(post, allPosts, 3);
  const explicitTools = (post.relatedToolSlugs || []).map((item) => tools.find((tool) => tool.slug === item)).filter(Boolean) as typeof tools;
  const relatedTools = (explicitTools.length ? explicitTools : tools.filter((tool) => tool.tags.some((tag) => post.tags.some((postTag) => tag.toLowerCase().includes(postTag.toLowerCase()) || postTag.toLowerCase().includes(tag.toLowerCase()))))).slice(0, 3);
  const author = getAuthorProfile(post.author);
  const siteUrl = normalizedSiteUrl();
  const articleUrl = `${siteUrl}/news/${encodedPathSegment(post.slug)}`;
  const authorUrl = `${siteUrl}/authors/${encodedPathSegment(author.slug)}`;
  const organizationId = `${siteUrl}/#organization`;
  const websiteId = `${siteUrl}/#website`;
  const publishedIso = isoDate(post.publishedAt);
  const modifiedIso = isoDate(post.updatedAt) || publishedIso;
  const editorialAuthor = post.author.toLowerCase().includes("rapidreach");
  const articleSchema = {
    "@type": "NewsArticle",
    "@id": `${articleUrl}#article`,
    headline: post.title,
    description: post.summary,
    image: post.featuredImageUrl ? [post.featuredImageUrl] : [`${siteUrl}/opengraph-image`],
    datePublished: publishedIso,
    dateModified: modifiedIso,
    author: editorialAuthor ? { "@id": organizationId } : { "@id": `${authorUrl}#person` },
    publisher: { "@id": organizationId },
    isPartOf: { "@id": websiteId },
    mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
    url: articleUrl,
    inLanguage: "en",
    isAccessibleForFree: true,
    articleSection: post.category,
    keywords: post.tags.join(", "),
    about: post.tags.map((tag) => ({ "@type": "Thing", name: tag })),
    ...(post.sources?.length ? { citation: post.sources.map((source) => source.url) } : {}),
  };
  const authorSchema = editorialAuthor ? null : {
    "@type": "Person",
    "@id": `${authorUrl}#person`,
    name: author.name,
    description: author.bio,
    url: authorUrl,
    jobTitle: author.role,
    ...(author.sameAs.length ? { sameAs: author.sameAs } : {}),
    worksFor: { "@id": organizationId },
  };
  const breadcrumbSchema = {
    "@type": "BreadcrumbList",
    "@id": `${articleUrl}#breadcrumbs`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "RapidReach", item: siteUrl },
      { "@type": "ListItem", position: 2, name: post.category, item: `${siteUrl}/category/${encodedPathSegment(post.category)}` },
      { "@type": "ListItem", position: 3, name: post.title, item: articleUrl },
    ],
  };
  const structuredData = { "@context": "https://schema.org", "@graph": [articleSchema, ...(authorSchema ? [authorSchema] : []), breadcrumbSchema] };

  return (
    <article className="article-page">
      <header className="article-hero shell article-shell">
        <div className="article-hero-top"><div className="eyebrow"><Link href={`/category/${encodeURIComponent(post.category)}`}>{post.category}</Link><span>•</span><time dateTime={publishedIso}>{formatDate(post.publishedAt, { dateStyle: "long" })}</time>{post.updatedAt && <><span>•</span><span>Updated {formatDate(post.updatedAt, { dateStyle: "medium" })}</span></>}</div><span className="article-type">RapidReach Analysis</span></div>
        <h1>{post.title}</h1><p className="dek">{post.summary}</p>
        <div className="article-ledger"><div><span>Written by</span><strong><Link href={`/authors/${author.slug}`}>{post.author}</Link></strong></div><div><span>Reading time</span><strong>{post.readingMinutes} minutes</strong></div><div><span>Filed under</span><strong>{post.category}</strong></div></div>
        <div className="article-personal-actions"><PreferenceButton kind="post" value={post.slug} label="Save story" savedLabel="Saved ✓" /><PreferenceButton kind="topic" value={post.category} label={`Follow ${post.category}`} savedLabel={`Following ${post.category} ✓`} /><Link className="quiet-link" href={`/news/${post.slug}/markdown`}>Markdown ↗</Link></div>
      </header>

      {post.featuredImageUrl && <figure className="article-featured-media shell"><img src={post.featuredImageUrl} alt={`Featured image for ${post.title}`} /></figure>}
      <div className="article-rule" />
      <div className={`shell article-shell article-body-wrap ${layoutStyles.bodyWrap}`}><aside className="quick-take"><div className="quick-take-head"><span className="section-kicker">Quick take</span><span aria-hidden="true">↓</span></div><p>{post.summary}</p><ul>{post.keyTakeaways.map((item) => <li key={item}>{item}</li>)}</ul></aside><div className="article-body"><ArticleContent content={post.content} /><div className="article-end-mark"><span>RR</span><i /></div><div className="tag-row">{post.tags.map((tag) => <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`}>#{tag}</Link>)}</div></div></div>

      {post.sources && post.sources.length > 0 && <section className="shell related-section"><div className="section-heading"><div><span className="section-kicker">Evidence</span><h2>Sources</h2></div><span className="issue-line">Primary links where available</span></div><div className="saved-link-list">{post.sources.map((source) => <a href={source.url} target="_blank" rel="noopener noreferrer" key={`${source.title}-${source.url}`}><strong>{source.title}</strong><span>{source.url}</span></a>)}</div></section>}

      {post.corrections && post.corrections.length > 0 && <section className="shell related-section"><div className="section-heading"><div><span className="section-kicker">Transparency</span><h2>Corrections and material updates</h2></div></div><div className="saved-link-list">{post.corrections.map((correction) => <div key={`${correction.date}-${correction.note}`}><strong>{correction.date}</strong><span>{correction.note}</span></div>)}</div></section>}

      <div className="shell article-shell"><Engagement slug={post.slug} title={post.title} initialLikes={post.likes}/></div>

      {relatedTools.length > 0 && <section className="shell related-section"><div className="section-heading"><div><span className="section-kicker">Tools behind the story</span><h2>Explore the software in this context</h2></div><Link className="quiet-link" href="/tools">All tools ↗</Link></div><div className="tool-list">{relatedTools.map((tool) => <ToolCard key={tool.slug} tool={tool} />)}</div></section>}
      {related.length > 0 && <section className="shell related-section"><div className="section-heading"><div><span className="section-kicker">Keep reading</span><h2>More on {post.category}</h2></div><Link className="quiet-link" href={`/category/${encodeURIComponent(post.category)}`}>Topic page ↗</Link></div><div className="related-grid">{related.map((item) => <ArticleCard key={item.slug} post={item} compact />)}</div></section>}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }} />
    </article>
  );
}
