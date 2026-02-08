'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Zap, ExternalLink, TrendingUp, AlertCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface NewsItem {
  id: string
  title: string
  description: string | null
  url: string | null
  source: string
  category: string
  release_version: string | null
  severity: string | null
  is_breaking: boolean
  announcement_date: string
  created_at: string
}

const severityColors = {
  info: 'text-blue-400 bg-blue-400/10',
  important: 'text-yellow-400 bg-yellow-400/10',
  critical: 'text-red-400 bg-red-400/10',
}

const categoryIcons: Record<string, string> = {
  kubernetes: '☸️',
  terraform: '🔷',
  aws: '☁️',
  azure: '🔷',
  gcp: '🌩️',
  cicd: '🔄',
  security: '🔒',
  observability: '📊',
  'platform-engineering': '🏗️',
}

export default function LiveInfrastructureFeed() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Fetch initial news items
    const fetchNews = async () => {
      const { data, error } = await supabase
        .from('news_feed')
        .select('*')
        .order('announcement_date', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Error fetching news:', error)
      } else {
        setNewsItems(data || [])
      }
      setIsLoading(false)
    }

    fetchNews()

    // Subscribe to real-time updates
    const channel = supabase
      .channel('news_feed_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'news_feed',
        },
        (payload) => {
          const newItem = payload.new as NewsItem
          setNewsItems((prev) => [newItem, ...prev.slice(0, 9)])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-electric-cyan"></div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-6 pt-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-electric-cyan/20">
            <Zap className="w-5 h-5 text-electric-cyan" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Live Feed</h2>
            <p className="text-xs text-gray-500">Real-time infrastructure updates</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyber-lime animate-pulse" />
          <span className="text-xs text-gray-400">Live</span>
        </div>
      </div>

      {/* News Items */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3">
        <AnimatePresence mode="popLayout">
          {newsItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="group"
            >
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-electric-cyan/50 transition-all duration-300 cursor-pointer">
                {/* Breaking News Badge */}
                {item.is_breaking && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-semibold mb-2"
                  >
                    <AlertCircle className="w-3 h-3" />
                    Breaking
                  </motion.div>
                )}

                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-lg">{categoryIcons[item.category] || '📰'}</span>
                    <h3 className="font-semibold text-white group-hover:text-electric-cyan transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                  </div>
                  {item.url && (
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-electric-cyan flex-shrink-0" />
                  )}
                </div>

                {/* Description */}
                {item.description && (
                  <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                    {item.description}
                  </p>
                )}

                {/* Metadata */}
                <div className="flex items-center gap-3 flex-wrap">
                  {item.release_version && (
                    <span className="px-2 py-1 rounded-lg bg-electric-cyan/10 text-electric-cyan text-xs font-mono">
                      {item.release_version}
                    </span>
                  )}
                  {item.severity && (
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${severityColors[item.severity as keyof typeof severityColors] || severityColors.info}`}>
                      {item.severity}
                    </span>
                  )}
                  <span className="px-2 py-1 rounded-lg bg-white/5 text-gray-400 text-xs">
                    {item.source}
                  </span>
                  <span className="text-xs text-gray-500 ml-auto">
                    {formatDistanceToNow(new Date(item.announcement_date), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {newsItems.length === 0 && (
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">No updates yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
