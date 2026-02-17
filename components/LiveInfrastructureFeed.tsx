'use client'

import { useEffect, useState } from 'react'
import { ExternalLink, Clock, RefreshCw, Rss } from 'lucide-react'

interface NewsItem {
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
  Kubernetes: 'bg-[#326CE5]/15 text-[#589CFA]',
  'Cloud Native': 'bg-[#5C4EE5]/15 text-[#8B7AFF]',
  Infrastructure: 'bg-[#F97316]/15 text-[#FB923C]',
  Containers: 'bg-[#06B6D4]/15 text-[#22D3EE]',
  Cloud: 'bg-[#FF9900]/15 text-[#FFB347]',
  DevOps: 'bg-cyber-lime/10 text-cyber-lime',
  Security: 'bg-[#10B981]/15 text-[#34D399]',
}

export default function LiveInfrastructureFeed() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchNews = async () => {
    try {
      const response = await fetch('/api/news-feed')
      const data = await response.json()
      setNewsItems(data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching news:', error)
      setNewsItems([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
    const interval = setInterval(fetchNews, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <div className="h-5 w-24 shimmer rounded" />
          <div className="h-4 w-16 shimmer rounded" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-3 rounded-lg bg-white/[0.02] space-y-2">
            <div className="h-4 shimmer rounded w-full" />
            <div className="h-3 shimmer rounded w-3/4" />
            <div className="flex gap-2">
              <div className="h-3 w-16 shimmer rounded" />
              <div className="h-3 w-12 shimmer rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.04]">
        <div className="flex items-center gap-2">
          <Rss className="w-3.5 h-3.5 text-electric-cyan" />
          <h3 className="text-sm font-semibold text-white">Live Feed</h3>
          <span className="flex h-1.5 w-1.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-lime opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyber-lime" />
          </span>
        </div>
        <button
          onClick={fetchNews}
          className="p-1 rounded hover:bg-white/[0.04] text-gray-600 hover:text-gray-400 transition-colors"
          title="Refresh feed"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="p-3 space-y-1.5">
          {newsItems.map((item) => (
            <a
              key={item.id}
              href={item.url || '#'}
              target={item.url ? '_blank' : undefined}
              rel={item.url ? 'noopener noreferrer' : undefined}
              className="block p-3 rounded-lg hover:bg-white/[0.03] transition-colors group"
            >
              <div className="flex items-start gap-2.5">
                <div className="flex-1 min-w-0">
                  <h4 className="text-[13px] font-medium text-gray-300 group-hover:text-white transition-colors leading-snug line-clamp-2 mb-1.5">
                    {item.title}
                  </h4>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${categoryColors[item.category] || 'bg-white/5 text-gray-400'}`}>
                      {item.category}
                    </span>
                    <span className="text-[10px] text-gray-600">{item.source}</span>
                    <span className="text-[10px] text-gray-600 flex items-center gap-0.5 ml-auto">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(item.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>

                {item.url && (
                  <ExternalLink className="w-3 h-3 text-gray-700 group-hover:text-electric-cyan flex-shrink-0 mt-1 transition-colors" />
                )}
              </div>
            </a>
          ))}

          {newsItems.length === 0 && (
            <div className="text-center py-8">
              <Rss className="w-8 h-8 text-gray-700 mx-auto mb-2" />
              <p className="text-xs text-gray-600">No updates available</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      {lastUpdated && (
        <div className="px-5 py-2 border-t border-white/[0.04]">
          <p className="text-[10px] text-gray-700">
            Updated {lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      )}
    </div>
  )
}
