import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/ArticleCard";
import { authorSlug, getAuthorProfile } from "@/lib/authors";
import { serializeJsonLd } from "@/lib/json-ld";
import { getPosts } from "@/lib/posts";
import { encodedPathSegment, normalizedSiteUrl } from "@/lib/public-format";

export async function generateStaticParams() {
  const posts = await getPosts();
  return [...new Set(posts.map((post) => authorSlug(post.author)))].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const posts = await getPosts();
  const authorName = posts.find((post) => authorSlug(post.author) === slug)?.author;
  if (!authorName) return {};
  const author = getAuthorProfile(authorName);
  return {
    title: `${author.name} — Author`,
    description: author.bio,
    alternates: { canonical: `/authors/${author.slug}` },
    openGraph: { title: `${author.name} — RapidReach`, description: author.bio, url: `/authors/${author.slug}` },
  };
}

export default async function AuthorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const posts = await getPosts();
  const authored = posts.filter((post) => authorSlug(post.author) === slug);
  if (!authored.length) notFound();

  const author = getAuthorProfile(authored[0].author);
  const siteUrl = normalizedSiteUrl();
  const pageUrl = `${siteUrl}/authors/${encodedPathSegment(author.slug)}`;
  const personId = `${pageUrl}#person`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": `${pageUrl}#profile`,
        url: pageUrl,
        name: `${author.name} — RapidReach`,
        mainEntity: { "@id": personId },
      },
      {
        "@type": "Person",
        "@id": personId,
        name: author.name,
        description: author.bio,
        url: pageUrl,
        jobTitle: author.role,
        ...(author.sameAs.length ? { sameAs: author.sameAs } : {}),
        worksFor: { "@id": `${siteUrl}/#organization` },
        knowsAbout: [...new Set(authored.flatMap((post) => [post.category, ...post.tags]))].slice(0, 20),
      },
    ],
  };

  return (
    <section className="shell archive-page">
      <header className="archive-header">
        <span className="section-kicker">RapidReach author</span>
        <h1>{author.name}</h1>
        <p>{author.bio}</p>
        <div className="tag-row">
          <span>{author.role}</span>
          {author.sameAs.map((url) => <a key={url} href={url} target="_blank" rel="noopener noreferrer">External profile ↗</a>)}
        </div>
      </header>
      <div className="section-heading"><div><span className="section-kicker">By {author.name}</span><h2>{authored.length} published stor{authored.length === 1 ? "y" : "ies"}</h2></div><Link className="quiet-link" href="/signals">Signal Desk ↗</Link></div>
      <div className="article-grid">{authored.map((post) => <ArticleCard key={post.slug} post={post} />)}</div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }} />
    </section>
  );
}
