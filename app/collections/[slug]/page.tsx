import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolCard } from "@/components/ToolCard";
import { ArticleCard } from "@/components/ArticleCard";
import { getCollectionBySlug } from "@/lib/collections";
import { getTools } from "@/lib/tools";
import { getPosts } from "@/lib/posts";
import { serializeJsonLd } from "@/lib/json-ld";
import { encodedPathSegment, normalizedSiteUrl } from "@/lib/public-format";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  return collection ? {
    title: collection.title,
    description: collection.description,
    alternates: { canonical: `/collections/${slug}` },
    openGraph: { title: collection.title, description: collection.description, url: `/collections/${slug}`, type: "website" },
    twitter: { card: "summary_large_image", title: collection.title, description: collection.description },
  } : {};
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) notFound();
  const [allTools, allPosts] = await Promise.all([getTools(), getPosts()]);
  const tools = collection.toolSlugs.map((item) => allTools.find((tool) => tool.slug === item)).filter(Boolean) as typeof allTools;
  const posts = collection.postSlugs.map((item) => allPosts.find((post) => post.slug === item)).filter(Boolean) as typeof allPosts;
  const siteUrl = normalizedSiteUrl();
  const pageUrl = `${siteUrl}/collections/${encodedPathSegment(collection.slug)}`;
  const listItems = [
    ...tools.map((tool, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: { "@type": "SoftwareApplication", name: tool.name, url: `${siteUrl}/tools/${encodedPathSegment(tool.slug)}` },
    })),
    ...posts.map((post, index) => ({
      "@type": "ListItem",
      position: tools.length + index + 1,
      item: { "@type": "NewsArticle", headline: post.title, url: `${siteUrl}/news/${encodedPathSegment(post.slug)}` },
    })),
  ];
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${pageUrl}#collection`,
        url: pageUrl,
        name: collection.title,
        description: collection.description,
        isPartOf: { "@id": `${siteUrl}/#website` },
        mainEntity: { "@type": "ItemList", numberOfItems: listItems.length, itemListElement: listItems },
        inLanguage: "en",
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumbs`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "RapidReach", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Builder Stacks", item: `${siteUrl}/collections` },
          { "@type": "ListItem", position: 3, name: collection.title, item: pageUrl },
        ],
      },
    ],
  };

  return <main className="collection-detail shell"><header className="collection-detail-hero"><span className="section-kicker">Editorial collection</span><h1>{collection.title}</h1><p>{collection.description}</p><div><span>{tools.length} tools</span><span>{posts.length} stories</span></div></header>{tools.length > 0 && <section className="tools-section"><div className="section-heading"><div><span className="section-kicker">The stack</span><h2>Tools in this collection</h2></div></div><div className="tool-list">{tools.map((tool) => <ToolCard key={tool.slug} tool={tool} />)}</div></section>}{posts.length > 0 && <section className="related-section"><div className="section-heading"><div><span className="section-kicker">Read the context</span><h2>Reporting behind the stack</h2></div></div><div className="related-grid">{posts.map((post) => <ArticleCard key={post.slug} post={post} compact />)}</div></section>}<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }} /></main>;
}
