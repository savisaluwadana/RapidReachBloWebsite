import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/ArticleCard";
import { ArticleContent } from "@/components/ArticleContent";
import layoutStyles from "@/components/ArticlePageLayout.module.css";
import { ToolCard } from "@/components/ToolCard";
import { Engagement } from "@/components/Engagement";
import { PreferenceButton } from "@/components/PreferenceButton";
import { serializeJsonLd } from "@/lib/json-ld";
import { getPostBySlug, getPosts } from "@/lib/posts";
import { getTools } from "@/lib/tools";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rapidreach.dev";

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  const images = post.featuredImageUrl ? [post.featuredImageUrl] : undefined;
  return { title: post.title, description: post.summary, alternates: { canonical: `/news/${post.slug}` }, openGraph: { type: "article", title: post.title, description: post.summary, publishedTime: post.publishedAt, modifiedTime: post.updatedAt || post.publishedAt, authors: [post.author], tags: post.tags, url: `/news/${post.slug}`, images }, twitter: { card: "summary_large_image", title: post.title, description: post.summary, images } };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  const [allPosts, tools] = await Promise.all([getPosts(), getTools()]);
  const related = allPosts.filter((item) => item.slug !== post.slug && (item.category === post.category || item.tags.some((tag) => post.tags.includes(tag)))).slice(0, 2);
  const explicitTools = (post.relatedToolSlugs || []).map((item) => tools.find((tool) => tool.slug === item)).filter(Boolean) as typeof tools;
  const relatedTools = (explicitTools.length ? explicitTools : tools.filter((tool) => tool.tags.some((tag) => post.tags.some((postTag) => tag.toLowerCase().includes(postTag.toLowerCase()) || postTag.toLowerCase().includes(tag.toLowerCase()))))).slice(0, 3);
  const articleSchema = { "@context": "https://schema.org", "@type": "NewsArticle", headline: post.title, description: post.summary, image: post.featuredImageUrl ? [post.featuredImageUrl] : undefined, datePublished: post.publishedAt, dateModified: post.updatedAt || post.publishedAt, author: { "@type": "Organization", name: post.author }, publisher: { "@type": "NewsMediaOrganization", name: "RapidReach", url: siteUrl }, mainEntityOfPage: `${siteUrl}/news/${post.slug}`, keywords: post.tags.join(", ") };

  return (
    <article className="article-page">
      <header className="article-hero shell article-shell">
        <div className="article-hero-top"><div className="eyebrow"><Link href={`/category/${encodeURIComponent(post.category)}`}>{post.category}</Link><span>•</span><time dateTime={post.publishedAt}>{new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(new Date(post.publishedAt))}</time></div><span className="article-type">RapidReach Analysis / 001</span></div>
        <h1>{post.title}</h1><p className="dek">{post.summary}</p>
        <div className="article-ledger"><div><span>Written by</span><strong>{post.author}</strong></div><div><span>Reading time</span><strong>{post.readingMinutes} minutes</strong></div><div><span>Filed under</span><strong>{post.category}</strong></div></div>
        <div className="article-personal-actions"><PreferenceButton kind="post" value={post.slug} label="Save story" savedLabel="Saved ✓" /><PreferenceButton kind="topic" value={post.category} label={`Follow ${post.category}`} savedLabel={`Following ${post.category} ✓`} /></div>
      </header>

      {post.featuredImageUrl && <figure className="article-featured-media shell"><img src={post.featuredImageUrl} alt={`Featured image for ${post.title}`} /></figure>}
      <div className="article-rule" />
      <div className={`shell article-shell article-body-wrap ${layoutStyles.bodyWrap}`}><aside className="quick-take"><div className="quick-take-head"><span className="section-kicker">Quick take</span><span aria-hidden="true">↓</span></div><p>{post.summary}</p><ul>{post.keyTakeaways.map((item) => <li key={item}>{item}</li>)}</ul></aside><div className="article-body"><ArticleContent content={post.content} /><div className="article-end-mark"><span>RR</span><i /></div><div className="tag-row">{post.tags.map((tag) => <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`}>#{tag}</Link>)}</div></div></div>

      <div className="shell article-shell"><Engagement slug={post.slug} title={post.title} initialLikes={post.likes}/></div>

      {relatedTools.length > 0 && <section className="shell related-section"><div className="section-heading"><div><span className="section-kicker">Tools behind the story</span><h2>Explore the software in this context</h2></div><Link className="quiet-link" href="/tools">All tools ↗</Link></div><div className="tool-list">{relatedTools.map((tool) => <ToolCard key={tool.slug} tool={tool} />)}</div></section>}
      {related.length > 0 && <section className="shell related-section"><div className="section-heading"><div><span className="section-kicker">Keep reading</span><h2>More from the signal desk</h2></div><Link className="quiet-link" href="/#latest">All stories ↗</Link></div><div className="related-grid">{related.map((item) => <ArticleCard key={item.slug} post={item} compact />)}</div></section>}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleSchema) }} />
    </article>
  );
}
