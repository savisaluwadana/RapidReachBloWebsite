'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, ExternalLink, TrendingUp, Clock } from 'lucide-react'

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

const categoryIcons: Record<string, string> = {
  Kubernetes: '☸️',
  Terraform: '🔷',
  'CI/CD': '🔄',
  Infrastructure: '🏗️',
  Containers: '📦',
  Cloud: '☁️',
  GitOps: '🔄',
  Security: '🔒',
}

export default function LiveInfrastructureFeed() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/news-feed')
        const data = await response.json()
        setNewsItems(data)
      } catch (error) {
        console.error('Error fetching news:', error)
        // Use demo data
        const now = new Date()
        setNewsItems([
          {
            id: '1',
            title: 'Kubernetes 1.30 Released with Enhanced Security',
            description: 'Latest release brings improved security controls and performance optimizations',
            source: 'CNCF',
            category: 'Kubernetes',
            url: 'https://kubernetes.io/blog',
            published_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
            is_featured: true,
            tags: ['kubernetes', 'release']
          },
          {
            id: '2',
            title: 'GitHub Actions Introduces Larger Runners',
            description: 'New runner sizes with up to 64 cores now available for enterprise customers',
            source: 'GitHub',
            category: 'CI/CD',
            url: 'https://github.blog',
            published_at: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
            is_featured: false,
            tags: ['github', 'ci-cd']
          },
          {
            id: '3',
            title: 'Terraform 1.8 Adds Native Validation Rules',
            description: 'Enhanced variable validation capabilities announced by HashiCorp',
            source: 'HashiCorp',
            category: 'Infrastructure',
            url: 'https://hashicorp.com/blog',
            published_at: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(),
            is_featured: false,
            tags: ['terraform', 'iac']
          },
          {
            id: '4',
            title: 'Docker Desktop 4.28 Performance Update',
            description: 'Faster container startup times and reduced memory usage',
            source: 'Docker',
            category: 'Containers',
            url: 'https://docker.com/blog',
            published_at: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
            is_featured: false,
            tags: ['docker', 'containers']
          }
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchNews()
    // Refresh every 5 minutes
    const interval = setInterval(fetchNews, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-electric-cyan/30 border-t-electric-cyan rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400">Loading news feed...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
      <div className="p-6 space-y-4">
        <AnimatePresence mode="popLayout">
          {newsItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <a
                href={item.url || '#'}
                target={item.url ? '_blank' : undefined}
                rel={item.url ? 'noopener noreferrer' : undefined}
                className={`block p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-electric-cyan/30 transition-all group ${
                  !item.url ? 'cursor-default' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{categoryIcons[item.category] || '📰'}</span>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-white group-hover:text-electric-cyan transition-colors line-clamp-2 flex-1">
                        {item.title}
                      </h3>
                      {item.url && (
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-electric-cyan flex-shrink-0 mt-1" />
                      )}
                    </div>

                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                      {item.description}
                    </p>

                    <div className="flex items-center gap-3 flex-wrap text-xs">
                      {item.is_featured && (
                        <span className="px-2 py-1 rounded-lg bg-cyber-lime/10 text-cyber-lime font-semibold flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Featured
                        </span>
                      )}
                      <span className="px-2 py-1 rounded-lg bg-electric-cyan/10 text-electric-cyan">
                        {item.category}
                      </span>
                      <span className="px-2 py-1 rounded-lg bg-white/5 text-gray-400">
                        {item.source}
                      </span>
                      <span className="text-gray-500 ml-auto flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.published_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            </motion.div>
          ))}
        </AnimatePresence>

        {newsItems.length === 0 && (
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">No updates yet</p>
            <p className="text-xs text-gray-600 mt-2">Configure Supabase to load real news</p>
          </div>
        )}
      </div>
    </div>
  )
}
