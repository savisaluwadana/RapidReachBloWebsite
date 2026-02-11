import Navbar from '@/components/Navbar'
import { Newspaper, TrendingUp, ExternalLink, Clock } from 'lucide-react'
import Link from 'next/link'
import { getNewsFeed } from '@/lib/actions/news'

export default async function NewsPage() {
  const newsFeed = await getNewsFeed()
  return (
    <main className="min-h-screen bg-deep-charcoal">
      <Navbar />

      <div className="container mx-auto px-6 pt-32 pb-20">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white via-electric-cyan to-cyber-lime bg-clip-text text-transparent">
              DevOps News & Updates
            </span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed">
            Real-time updates from the Cloud Native ecosystem
          </p>
        </div>

        {/* News Feed */}
        <div className="max-w-4xl mx-auto">
          {newsFeed.length > 0 ? (
            <div className="space-y-4">
              {newsFeed.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="px-3 py-1 rounded-lg bg-electric-cyan/10 text-electric-cyan text-sm font-semibold">
                          {item.category}
                        </span>
                        <span className="text-gray-400 text-sm">{item.source}</span>
                        <span className="flex items-center gap-1 text-gray-500 text-sm">
                          <Clock className="w-3 h-3" />
                          {new Date(item.announcement_date || item.created_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {item.is_breaking && (
                          <span className="flex items-center gap-1 text-cyber-lime text-sm">
                            <TrendingUp className="w-4 h-4" />
                            Breaking
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-2 hover:text-electric-cyan transition-colors">
                        {item.url ? (
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                            {item.title}
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        ) : (
                          item.title
                        )}
                      </h3>
                      
                      <p className="text-gray-400 mb-3">{item.description}</p>
                      
                      <div className="flex flex-wrap gap-2">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 rounded-full bg-white/5 text-gray-400 text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-12 text-center">
              <Newspaper className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No News Yet</h3>
              <p className="text-gray-400 mb-4">Check back soon for the latest DevOps updates!</p>
              <p className="text-sm text-electric-cyan">💡 Configure Supabase to load real news feed (see SETUP_GUIDE.md)</p>
            </div>
          )}
        </div>

        {/* Coming Soon Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6 text-center">
            <Newspaper className="w-12 h-12 text-electric-cyan mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Newsletter Archive</h3>
            <p className="text-gray-400 text-sm">Coming Soon</p>
          </div>
          <div className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6 text-center">
            <TrendingUp className="w-12 h-12 text-cyber-lime mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Trending Topics</h3>
            <p className="text-gray-400 text-sm">Coming Soon</p>
          </div>
          <div className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6 text-center">
            <Newspaper className="w-12 h-12 text-purple-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Release Notes</h3>
            <p className="text-gray-400 text-sm">Coming Soon</p>
          </div>
        </div>
      </div>
    </main>
  )
}
