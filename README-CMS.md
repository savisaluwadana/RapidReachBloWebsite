# RapidReach CMS & Tool Directory

RapidReach now combines two public surfaces:

- developer news and analysis
- curated developer-tool discovery

## Admin access

Set these environment variables:

```bash
MONGODB_URI=...
MONGODB_DB=rapidreach
NEXT_PUBLIC_SITE_URL=https://your-domain.com
ADMIN_PASSWORD=use-a-long-random-password
```

Then open `/admin/login`.

The admin session uses an HttpOnly cookie derived from `ADMIN_PASSWORD`; there is intentionally no full user-account system.

## CMS

`/admin` provides:

- overview and publishing counts
- news category management
- tool category management
- post create/edit/delete and draft/publish state
- developer-tool create/edit/delete and draft/publish state

## Tool listings

A tool can store:

- name and slug
- tagline and full explanation
- website and GitHub URL
- logo URL
- maker/company
- pricing model
- open-source status
- tool category
- tags
- launch date
- featured state
- draft/published state
- upvote count

Public routes:

- `/tools`
- `/tools/[slug]`
- `/tools/category/[slug]`
- `/api/tools`

Tool profiles use `SoftwareApplication` JSON-LD and are included in the sitemap and `llms.txt`.

## Database setup

Run:

```bash
npm run seed
```

The seed creates starter posts, news categories, tool categories, starter tools, and MongoDB indexes.
