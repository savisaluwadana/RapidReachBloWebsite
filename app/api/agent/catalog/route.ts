import { NextResponse } from "next/server";
import { getAuthorProfile } from "@/lib/authors";
import { getCollections } from "@/lib/collections";
import { getPosts } from "@/lib/posts";
import { getTools } from "@/lib/tools";
import { normalizedSiteUrl } from "@/lib/public-format";
import {
  collectionCanonicalUrl,
  collectionMarkdownUrl,
  postCanonicalUrl,
  postMarkdownUrl,
  publicPostsForAgents,
  toolCanonicalUrl,
  toolMarkdownUrl,
} from "@/lib/agent-content";

export async function GET() {
  const siteUrl = normalizedSiteUrl();
  const [allPosts, tools, collections] = await Promise.all([getPosts(), getTools(), getCollections()]);
  const posts = publicPostsForAgents(allPosts);
  const toolSlugs = new Set(tools.map((tool) => tool.slug));
  const postSlugs = new Set(posts.map((post) => post.slug));

  return NextResponse.json(
    {
      schemaVersion: "1.0",
      generatedAt: new Date().toISOString(),
      site: {
        name: "RapidReach",
        canonical: siteUrl,
        description: "Developer intelligence, software-engineering analysis, developer-tool profiles, and curated engineering collections.",
        llms: `${siteUrl}/llms.txt`,
        sectionIndexes: {
          stories: `${siteUrl}/news/llms.txt`,
          tools: `${siteUrl}/tools/llms.txt`,
          collections: `${siteUrl}/collections/llms.txt`,
        },
        fullContext: `${siteUrl}/llms-full.txt`,
        editorialStandards: `${siteUrl}/about`,
        rss: `${siteUrl}/feed.xml`,
        sitemap: `${siteUrl}/sitemap.xml`,
      },
      guidance: {
        attribution: "RapidReach editorial analysis should be attributed to RapidReach.",
        productFacts: "Decision-critical product facts that can change over time should be verified against the official website or repository in the tool record.",
        visibility: "This catalog includes currently public entities only. Draft records and future-dated stories are excluded.",
      },
      stories: posts.map((post) => {
        const author = getAuthorProfile(post.author);
        return {
          type: "story",
          slug: post.slug,
          title: post.title,
          summary: post.summary,
          canonical: postCanonicalUrl(siteUrl, post),
          markdown: postMarkdownUrl(siteUrl, post),
          author: {
            name: author.name,
            profile: `${siteUrl}/authors/${author.slug}`,
          },
          category: post.category,
          tags: post.tags,
          publishedAt: post.publishedAt,
          updatedAt: post.updatedAt || null,
          sources: (post.sources || []).map((source) => ({ title: source.title, url: source.url })),
          corrections: post.corrections || [],
          relatedTools: (post.relatedToolSlugs || []).filter((slug) => toolSlugs.has(slug)),
        };
      }),
      tools: tools.map((tool) => ({
        type: "tool",
        slug: tool.slug,
        name: tool.name,
        summary: tool.tagline,
        description: tool.description,
        canonical: toolCanonicalUrl(siteUrl, tool),
        markdown: toolMarkdownUrl(siteUrl, tool),
        officialWebsite: tool.website,
        github: tool.github || null,
        maker: tool.maker || null,
        category: tool.category,
        tags: tool.tags,
        pricing: tool.pricing,
        openSource: tool.openSource,
        launchedAt: tool.launchedAt,
        updatedAt: tool.updatedAt || null,
        rapidReachAnalysis: tool.verdict || null,
        alternatives: (tool.alternatives || []).filter((slug) => toolSlugs.has(slug)),
        relatedStories: (tool.relatedPostSlugs || []).filter((slug) => postSlugs.has(slug)),
      })),
      collections: collections.map((collection) => ({
        type: "collection",
        slug: collection.slug,
        title: collection.title,
        description: collection.description,
        canonical: collectionCanonicalUrl(siteUrl, collection),
        markdown: collectionMarkdownUrl(siteUrl, collection),
        featured: collection.featured,
        createdAt: collection.createdAt,
        updatedAt: collection.updatedAt || null,
        tools: collection.toolSlugs.filter((slug) => toolSlugs.has(slug)),
        stories: collection.postSlugs.filter((slug) => postSlugs.has(slug)),
      })),
    },
    {
      headers: {
        "cache-control": "public, s-maxage=300, stale-while-revalidate=600",
        Link: `<${siteUrl}/llms.txt>; rel="describedby"`,
      },
    },
  );
}
