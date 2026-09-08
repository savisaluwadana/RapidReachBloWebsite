import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Engagement } from "@/components/Engagement";
import { getPostBySlug, getPosts } from "@/lib/posts";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rapidreach.dev";

export async function generateStaticParams() { const posts = await getPosts(); return posts.map((post) => ({ slug: post.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const post = await getPostBySlug(slug); if (!post) return {};
  return { title: post.title, description: post.summary, alternates: { canonical: `/news/${post.slug}` }, openGraph: { type: "article", title: post.title, description: post.summary, publishedTime: post.publishedAt, modifiedTime: post.updatedAt || post.publishedAt, authors: [post.author], tags: post.tags, url: `/news/${post.slug}` }, twitter: { card: "summary_large_image", title: post.title, description: post.summary } };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const post = await getPostBySlug(slug); if (!post) notFound();
  const articleSchema = { "@context": "https://schema.org", "@type": "NewsArticle", headline: post.title, description: post.summary, datePublished: post.publishedAt, dateModified: post.updatedAt || post.publishedAt, author: { "@type": "Organization", name: post.author }, publisher: { "@type": "NewsMediaOrganization", name: "RapidReach", url: siteUrl }, mainEntityOfPage: `${siteUrl}/news/${post.slug}`, keywords: post.tags.join(", ") };
  return <article className="article-page"><header className="article-hero shell article-shell"><div className="eyebrow"><Link href={`/category/${encodeURIComponent(post.category)}`}>{post.category}</Link><span>•</span><time dateTime={post.publishedAt}>{new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(new Date(post.publishedAt))}</time></div><h1>{post.title}</h1><p className="dek">{post.summary}</p><div className="byline"><strong>{post.author}</strong><span>{post.readingMinutes} min read</span><span>{post.likes} likes</span></div></header><div className="article-rule"/><div className="shell article-shell article-body-wrap"><aside className="quick-take"><span className="section-kicker">Quick take</span><p>{post.summary}</p><ul>{post.keyTakeaways.map((item) => <li key={item}>{item}</li>)}</ul></aside><div className="article-body">{post.content.split("\n\n").map((paragraph, index) => <p key={index}>{paragraph}</p>)}<div className="tag-row">{post.tags.map((tag) => <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`}>#{tag}</Link>)}</div></div></div><div className="shell article-shell"><Engagement slug={post.slug} title={post.title} initialLikes={post.likes}/></div><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} /></article>;
}
