import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Newspaper, TrendingUp, ExternalLink, Clock } from 'lucide-react'
import { getNewsFeed } from '@/lib/actions/news'

export default async function NewsPage() {
  const newsFeed = await getNewsFeed()
  return (
    <main className="min-h-screen bg-deep-charcoal">
      <Navbar />

      <div className="container mx-auto px-6 pt-28 pb-20">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="text-xs text-electric-cyan uppercase tracking-widest font-medium mb-3">Live Feed</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">DevOps News</h1>
          <p className="text-sm text-gray-500 max-w-lg mx-auto">
            Real-time updates from the Cloud Native ecosystem.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {newsFeed.length > 0 ? (
            <div className="space-y-3">
              {newsFeed.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5 hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="px-2 py-0.5 rounded bg-electric-cyan/10 text-electric-cyan text-[10px] font-semibold uppercase tracking-wider">
                      {item.category}
                    </span>
                    <span className="text-[11px] text-gray-600">{item.source}</span>
                    <span className="flex items-center gap-1 text-[11px] text-gray-600">
                      <Clock className="w-3 h-3" />
                      {new Date(item.announcement_date || item.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {item.is_breaking && (
                      <span className="flex items-center gap-1 text-cyber-lime text-[10px] font-semibold uppercase">
                        <TrendingUp className="w-3 h-3" />
                        Breaking
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-white mb-1.5 group-hover:text-electric-cyan transition-colors">
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-1.5 hover:text-electric-cyan transition-colors"
                      >
                        {item.title}
                        <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      </a>
                    ) : (
                      item.title
                    )}
                  </h3>

                  <p className="text-xs text-gray-500 mb-2.5 line-clamp-2">{item.description}</p>

                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 rounded bg-white/[0.03] text-gray-600 text-[10px]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-10 text-center">
              <Newspaper className="w-10 h-10 text-gray-700 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-white mb-1">No News Yet</h3>
              <p className="text-sm text-gray-500">Check back soon for the latest DevOps updates.</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}
