# RapidReach

RapidReach is a focused developer publication and developer-tool discovery site built with Next.js, MongoDB, and a deliberately small publishing CMS.

## Product surfaces

### Developer news
- Premium editorial homepage and responsive article pages
- Managed news categories
- Search, comments, likes, and social sharing
- Featured article images
- Draft / published workflow through `/admin/posts`

### Developer tool discovery
- Product Hunt-style `/tools` directory
- Tool category pages and individual `/tools/[slug]` profiles
- Tool upvotes, featured tools, pricing, open-source metadata, maker/company, website and GitHub links
- Tool logo images and screenshot galleries
- Tool CRUD through `/admin/tools`

### CMS
- `/admin/login` uses the same account/session system as members, with admin access enforced by role
- The first admin on a fresh database can be bootstrapped with `ADMIN_EMAIL` and `ADMIN_PASSWORD`
- `/admin` overview
- `/admin/categories` for separate news and tool taxonomies
- `/admin/posts` for blog CRUD
- `/admin/tools` for developer-tool CRUD
- Category rename propagation to existing posts/tools

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- MongoDB / MongoDB Atlas
- Vercel Blob for public media
- Plain CSS

There is no separate backend service. RapidReach stays one Next.js application plus MongoDB and Blob object storage.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

## Environment

```env
MONGODB_URI=mongodb+srv://...
MONGODB_DB=rapidreach
NEXT_PUBLIC_SITE_URL=https://your-domain.com

ADMIN_EMAIL=admin@your-domain.com
ADMIN_PASSWORD=use-a-long-random-password

BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...

# Optional: use a deployment-specific random value for comment rate-limit hashing.
COMMENT_RATE_LIMIT_SALT=replace-with-a-random-secret

# Optional weekly briefing delivery.
RESEND_API_KEY=re_...
BRIEFING_FROM_EMAIL=RapidReach <briefing@your-domain.com>
```

`BLOB_READ_WRITE_TOKEN` is useful for local development and token-based Blob stores. New Vercel projects can use Blob OIDC authentication instead. Connect a **Public** Blob store because RapidReach logos, article images, and screenshots are public web assets.

## Seed MongoDB

```bash
export MONGODB_URI='mongodb+srv://...'
export MONGODB_DB=rapidreach
npm run seed
```

The seed script creates the starter content and MongoDB indexes.

## Collections

### `posts`

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
  featuredImageUrl,
  readingMinutes,
  tags: [],
  keyTakeaways: [],
  likes,
  status: 'published' | 'draft'
}
```

### `tools`

```js
{
  slug,
  name,
  tagline,
  description,
  website,
  github,
  logoUrl,
  screenshots: [],
  maker,
  pricing: 'free' | 'freemium' | 'paid' | 'open-source',
  openSource,
  category,
  tags: [],
  featured,
  status: 'published' | 'draft',
  launchedAt,
  updatedAt,
  upvotes
}
```

### `categories`

News and tool categories share the collection but are separated by `kind: 'post' | 'tool'`.

### `comments`

```js
{
  postSlug,
  userId,
  name,
  body,
  status,
  createdAt,
  editedAt
}
```

## Media uploads

The CMS supports two media workflows:

1. Upload an image directly from the admin UI. The browser uploads straight to Vercel Blob and the returned public URL is saved in MongoDB when the editor form is saved.
2. Paste an existing public **HTTPS** image URL instead of uploading.

Supported uploads: JPEG, PNG, WebP, GIF, and AVIF. Each image is limited to 8 MB. Tool profiles support up to 8 screenshots.

Media fields:
- Blog featured image
- Tool logo
- Tool screenshot gallery

## SEO / AEO / GEO / agents

Published stories expose `NewsArticle` JSON-LD and use featured images in social metadata when available. Tool pages expose `SoftwareApplication` JSON-LD and include logos/screenshots in metadata. RapidReach also exposes:

- `/sitemap.xml`
- `/robots.txt`
- `/feed.xml`
- `/llms.txt`
- `/api/posts`
- `/api/tools`

## Production notes

Use a public Vercel Blob store for public media. Direct client uploads are used so large image uploads do not have to pass through the Next.js function request body. Set MongoDB, the public site URL, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and Blob configuration before using the CMS. Set the Resend variables before sending the weekly briefing.
