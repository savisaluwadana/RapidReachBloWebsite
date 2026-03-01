import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Newspaper, TrendingUp, ExternalLink, Clock, Rss, RefreshCw } from 'lucide-react'

interface RSSItem {
  id: string
  title: string
  description: string
  source: string
  category: string
  url?: string
  published_at: string
  is_featured: boolean
  tags: string[]
}

const categoryColors: Record<string, string> = {
  Kubernetes:       'bg-[#326CE5]/15 text-[#589CFA]',
  'Cloud Native':   'bg-[#5C4EE5]/15 text-[#8B7AFF]',
  Infrastructure:   'bg-[#F97316]/15 text-[#FB923C]',
  Containers:       'bg-[#06B6D4]/15 text-[#22D3EE]',
  Cloud:            'bg-[#FF9900]/15 text-[#FFB347]',
  DevOps:           'bg-cyber-lime/10 text-cyber-lime',
  Security:         'bg-[#10B981]/15 text-[#34D399]',
}

async function fetchRSSItems(): Promise<RSSItem[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
    const res = await fetch(`${baseUrl}/api/news-feed`, {
      next: { revalidate: 900 },
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export const revalidate = 900

export default async function NewsPage() {
  const items = await fetchRSSItems()

  return (
    <main className="min-h-screen bg-deep-charcoal">
      <Navbar />

      <div className="container mx-auto px-6 pt-28 pb-20">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] mb-5">
            <span className="flex h-1.5 w-1.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-lime opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyber-lime" />
            </span>
            <Rss className="w-3 h-3 text-gray-500" />
            <span className="text-xs text-gray-400">Live RSS · refreshes every 15 min</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">DevOps News</h1>
          <p className="text-sm text-gray-500 max-w-lg mx-auto">
            Real-time updates from Kubernetes, CNCF, HashiCorp, Docker, AWS, and more.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {items.length > 0 ? (
            <div className="space-y-3">
              {items.map((item, idx) => (
                <a
                  key={item.id}
                  href={item.url || '#'}
                  target={item.url ? '_blank' : undefined}
                  rel={item.url ? 'noopener noreferrer' : undefined}
                  className="block rounded-xl bg-white/[0.02] border border-white/[0.04] p-5 hover:bg-white/[0.04] hover:border-white/[0.07] transition-colors group"
                >
                  <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${categoryColors[item.category] || 'bg-white/[0.05] text-gray-400'}`}>
                      {item.category}
                    </span>
                    <span className="text-[11px] text-gray-600">{item.source}</span>
                    <span className="flex items-center gap-1 text-[11px] text-gray-600 ml-auto">
                      <Clock className="w-3 h-3" />
                      {new Date(item.published_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </span>
                    {idx === 0 && (
                      <span className="flex items-center gap-1 text-cyber-lime text-[10px] font-semibold uppercase">
                        <TrendingUp className="w-3 h-3" />
                        Latest
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-white group-hover:text-electric-cyan transition-colors mb-1.5 flex items-start gap-1.5">
                    <span className="flex-1">{item.title}</span>
                    {item.url && <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-60 transition-opacity" />}
                  </h3>

                  {item.description && (
                    <p className="text-xs text-gray-500 mb-2.5 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag) => (
                      <span key={tag} className="px-1.5 py-0.5 rounded bg-white/[0.03] text-gray-600 text-[10px]">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-12 text-center">
              <Newspaper className="w-10 h-10 text-gray-700 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-white mb-1">Unable to load feed</h3>
              <p className="text-sm text-gray-500 mb-4">Could not reach the RSS sources. Try refreshing.</p>
              <a
                href="/news"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm text-gray-300 hover:bg-white/[0.07] transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </a>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}

