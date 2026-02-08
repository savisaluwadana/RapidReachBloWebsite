import Navbar from '@/components/Navbar'
import LiveInfrastructureFeed from '@/components/LiveInfrastructureFeed'
import { Newspaper, TrendingUp } from 'lucide-react'

export default function NewsPage() {
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

        {/* Live Feed */}
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-electric-cyan" />
                <h2 className="text-2xl font-bold text-white">Live Infrastructure Feed</h2>
              </div>
            </div>
            <div className="h-[800px]">
              <LiveInfrastructureFeed />
            </div>
          </div>

          {/* Coming Soon Features */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
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
      </div>
    </main>
  )
}
