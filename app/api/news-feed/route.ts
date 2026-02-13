import { NextResponse } from 'next/server'

// ─── RSS Feed Sources for DevOps & Platform Engineering ───
const RSS_SOURCES = [
  {
    name: 'Kubernetes Blog',
    url: 'https://kubernetes.io/feed.xml',
    category: 'Kubernetes',
    icon: '☸️',
  },
  {
    name: 'CNCF Blog',
    url: 'https://www.cncf.io/blog/feed/',
    category: 'Cloud Native',
    icon: '☁️',
  },
  {
    name: 'HashiCorp Blog',
    url: 'https://www.hashicorp.com/blog/feed.xml',
    category: 'Infrastructure',
    icon: '🔷',
  },
  {
    name: 'Docker Blog',
    url: 'https://www.docker.com/blog/feed/',
    category: 'Containers',
    icon: '📦',
  },
  {
    name: 'AWS DevOps Blog',
    url: 'https://aws.amazon.com/blogs/devops/feed/',
    category: 'Cloud',
    icon: '☁️',
  },
  {
    name: 'DevOps.com',
    url: 'https://devops.com/feed/',
    category: 'DevOps',
    icon: '🔄',
  },
  {
    name: 'The New Stack',
    url: 'https://thenewstack.io/feed/',
    category: 'Cloud Native',
    icon: '🏗️',
  },
]

interface FeedItem {
  id: string
  title: string
  description: string
  source: string
  category: string
  url: string
  published_at: string
  is_featured: boolean
  tags: string[]
}

// Simple XML tag extractor (avoids needing an XML parser library)
function extractTag(xml: string, tag: string): string {
  // Handle CDATA sections
  const cdataRegex = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`, 'i')
  const cdataMatch = xml.match(cdataRegex)
  if (cdataMatch) return cdataMatch[1].trim()

  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i')
  const match = xml.match(regex)
  return match ? match[1].trim() : ''
}

function extractLink(itemXml: string): string {
  // Try <link> tag first
  const linkMatch = itemXml.match(/<link[^>]*>([^<]+)<\/link>/i)
  if (linkMatch) return linkMatch[1].trim()

  // Try Atom-style <link href="..."/>
  const atomMatch = itemXml.match(/<link[^>]*href=["']([^"']+)["'][^>]*\/?>/i)
  if (atomMatch) return atomMatch[1].trim()

  // Try <guid> as fallback
  const guidMatch = itemXml.match(/<guid[^>]*>([^<]+)<\/guid>/i)
  if (guidMatch && guidMatch[1].startsWith('http')) return guidMatch[1].trim()

  return ''
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim()
}

async function fetchRSSFeed(source: typeof RSS_SOURCES[number]): Promise<FeedItem[]> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000) // 8s timeout

    const response = await fetch(source.url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'RapidReach-DevOps-Blog/1.0' },
      next: { revalidate: 900 }, // Cache for 15 minutes
    })
    clearTimeout(timeout)

    if (!response.ok) return []

    const xml = await response.text()

    // Split items (works for both RSS <item> and Atom <entry>)
    const isAtom = xml.includes('<feed') && xml.includes('<entry')
    const itemTag = isAtom ? 'entry' : 'item'
    const itemRegex = new RegExp(`<${itemTag}[\\s>][\\s\\S]*?</${itemTag}>`, 'gi')
    const items = xml.match(itemRegex) || []

    return items.slice(0, 5).map((item, index) => {
      const title = stripHtml(extractTag(item, 'title'))
      const descRaw = extractTag(item, isAtom ? 'summary' : 'description') ||
                       extractTag(item, 'content')
      const description = stripHtml(descRaw).slice(0, 200)
      const link = extractLink(item)
      const pubDateStr = extractTag(item, isAtom ? 'updated' : 'pubDate') ||
                         extractTag(item, 'published') ||
                         extractTag(item, 'dc:date')
      const published_at = pubDateStr ? new Date(pubDateStr).toISOString() : new Date().toISOString()

      // Extract categories/tags from the feed
      const categoryMatches = item.match(/<category[^>]*>([^<]+)<\/category>/gi) || []
      const tags = categoryMatches
        .map(c => stripHtml(c.replace(/<[^>]*>/g, '')))
        .filter(Boolean)
        .slice(0, 3)

      return {
        id: `${source.name.toLowerCase().replace(/\s+/g, '-')}-${index}-${Date.now()}`,
        title: title || 'Untitled',
        description: description || '',
        source: source.name,
        category: source.category,
        url: link,
        published_at,
        is_featured: index === 0,
        tags: tags.length > 0 ? tags : [source.category.toLowerCase()],
      }
    }).filter(item => item.title && item.title !== 'Untitled')
  } catch (error) {
    // Silently skip failed feeds
    console.warn(`Failed to fetch RSS from ${source.name}:`, (error as Error).message)
    return []
  }
}

export async function GET() {
  try {
    // Fetch all RSS feeds in parallel
    const results = await Promise.allSettled(
      RSS_SOURCES.map(source => fetchRSSFeed(source))
    )

    // Flatten and collect successful results
    const allItems: FeedItem[] = results
      .filter((r): r is PromiseFulfilledResult<FeedItem[]> => r.status === 'fulfilled')
      .flatMap(r => r.value)

    // Sort by publish date, newest first
    allItems.sort((a, b) =>
      new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    )

    // Return top 20
    return NextResponse.json(allItems.slice(0, 20), {
      headers: {
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
      },
    })
  } catch (error) {
    console.error('Error in news API:', error)
    return NextResponse.json([], { status: 500 })
  }
}
