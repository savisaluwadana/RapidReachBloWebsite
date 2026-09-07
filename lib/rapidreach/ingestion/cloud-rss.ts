import { createHash } from 'crypto'
import type { IntelligenceAdapter, IngestedSignal } from './types'

type FeedConfig = { provider: string; technology: string; url: string; domain: string }

const DEFAULT_FEEDS: FeedConfig[] = [
  {
    provider: 'aws',
    technology: 'AWS',
    url: 'https://aws.amazon.com/about-aws/whats-new/recent/feed/',
    domain: 'Cloud Infrastructure',
  },
]

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tag(block: string, name: string) {
  const match = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, 'i'))
  return match ? decodeXml(match[1]) : ''
}

function parseItems(xml: string) {
  return [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)].map((match) => match[1])
}

export class CloudRssAdapter implements IntelligenceAdapter {
  readonly name = 'cloud-rss'

  constructor(private readonly feeds = configuredFeeds()) {}

  async fetchSignals(): Promise<IngestedSignal[]> {
    const signals: IngestedSignal[] = []
    for (const feed of this.feeds) {
      const response = await fetch(feed.url, {
        headers: { 'User-Agent': 'RapidReach-Engineering-Intelligence/1.0' },
        next: { revalidate: 0 },
      })
      if (!response.ok) throw new Error(`${feed.provider} feed: ${response.status} ${response.statusText}`)
      const xml = await response.text()
      for (const item of parseItems(xml).slice(0, 30)) {
        const title = tag(item, 'title')
        const link = tag(item, 'link')
        const description = tag(item, 'description')
        const published = tag(item, 'pubDate')
        if (!title || !link) continue
        const externalId = createHash('sha256').update(`${feed.provider}:${link}`).digest('hex').slice(0, 32)
        signals.push({
          sourceProvider: feed.provider,
          externalId,
          sourceUrl: link,
          signalType: 'cloud-change',
          title,
          summary: description.slice(0, 900) || `A new ${feed.provider.toUpperCase()} platform update was published.`,
          severity: 'low',
          domain: feed.domain,
          technology: feed.technology,
          recommendedAction: 'Compare the provider change with services used in your stack and validate region, API, pricing, security, and compatibility implications before acting.',
          publishedAt: published ? new Date(published).toISOString() : undefined,
          evidence: { feed: feed.url },
        })
      }
    }
    return signals
  }
}

function configuredFeeds(): FeedConfig[] {
  const raw = process.env.RAPIDREACH_CLOUD_FEEDS
  if (!raw) return DEFAULT_FEEDS
  try {
    const value = JSON.parse(raw) as FeedConfig[]
    return Array.isArray(value) && value.length ? value : DEFAULT_FEEDS
  } catch {
    return DEFAULT_FEEDS
  }
}
