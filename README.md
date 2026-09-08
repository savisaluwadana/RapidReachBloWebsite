# RapidReach

RapidReach is a focused developer-news publication built with Next.js and MongoDB. It intentionally avoids the product/dashboard complexity that previously lived in this repository.

## What it includes

- Premium editorial homepage and responsive article layout
- Topic/category archives and site search
- MongoDB-backed posts, comments, and article likes
- Share actions for native share, X, LinkedIn, Reddit, and Hacker News
- Server-rendered semantic article HTML
- Per-article NewsArticle JSON-LD
- Canonical metadata, Open Graph, Twitter metadata, robots.txt, and dynamic sitemap
- RSS feed at `/feed.xml`
- Agent-readable publication index at `/llms.txt`
- Structured JSON feed at `/api/posts`
- Built-in starter content if MongoDB is not configured, so the UI never boots empty

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- MongoDB / MongoDB Atlas
- Plain CSS for a smaller dependency surface and predictable performance

There is no separate Go service, Supabase dependency, client state framework, rich-text editor, or MCP server in this simplified version.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

## MongoDB

Create a MongoDB Atlas database and configure:

```env
MONGODB_URI=mongodb+srv://...
MONGODB_DB=rapidreach
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

Seed the starter posts into MongoDB:

```bash
export MONGODB_URI='mongodb+srv://...'
export MONGODB_DB='rapidreach'
npm run seed
```

### Collections

`posts`

```js
{
  slug,
  title,
  summary,
  content,
  category,
  author,
  publishedAt,
  updatedAt,
  readingMinutes,
  tags: [],
  keyTakeaways: [],
  likes,
  status: 'published' | 'draft'
}
```

`comments`

```js
{
  postSlug,
  name,
  body,
  createdAt,
  status: 'visible' | 'hidden'
}
```

## Publishing a story

For now, publishing stays intentionally simple: add or update a document in the `posts` collection. The public site only selects documents with `status: "published"`.

A future lightweight editor can be added later without changing the public architecture. Keeping authoring separate from the reader experience prevents RapidReach from becoming another complex platform again.

## SEO / AEO / GEO / agent readability

Every published story has a crawlable canonical URL under `/news/[slug]`, plain semantic article content, a concise summary, explicit key takeaways, topic tags, published dates, and NewsArticle structured data. The site also exposes `/sitemap.xml`, `/robots.txt`, `/feed.xml`, `/llms.txt`, and `/api/posts` so search engines, answer engines, feed readers, and agents do not need to reverse engineer the UI.

## Production notes

Before opening comments to large public traffic, add rate limiting and spam moderation at the edge or API layer. MongoDB indexes are created by the seed script. For Vercel, set the three environment variables in Project Settings and deploy the Next.js app normally.
