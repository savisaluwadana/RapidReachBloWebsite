import Navbar from '@/components/Navbar'
import ArticleCard from '@/components/ArticleCard'
import Footer from '@/components/Footer'
import { Search, TrendingUp, Clock, Zap } from 'lucide-react'
import { getPosts } from '@/lib/actions/posts'

export default async function BlogPage() {
  const allPosts = await getPosts({ status: 'published' })
  
  return (
    <main className="min-h-screen bg-deep-charcoal">
      <Navbar />
      
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-mesh-gradient opacity-20" />
        
        <div className="relative container mx-auto px-6">
          {/* Header */}
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white via-electric-cyan to-cyber-lime bg-clip-text text-transparent">
                All Articles
              </span>
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              Comprehensive guides, tutorials, and insights on DevOps and Cloud Native technologies.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search articles..."
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-electric-cyan/50"
              />
            </div>
          </div>
          
          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Sort by:</span>
              {[
                { label: 'Latest', icon: Clock },
                { label: 'Trending', icon: TrendingUp },
                { label: 'Popular', icon: Zap },
              ].map((sort) => (
                <button
                  key={sort.label}
                  className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
                    sort.label === 'Latest'
                      ? 'bg-electric-cyan/20 text-electric-cyan'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <sort.icon className="w-4 h-4" />
                  {sort.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Articles Grid */}
          {allPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allPosts.map((post) => (
                <ArticleCard
                  key={post.id}
                  title={post.title}
                  excerpt={post.excerpt}
                  author={{
                    name: post.author?.full_name || 'Anonymous',
                    avatar: post.author?.avatar_url || '',
                    role: post.author?.role || 'Contributor',
                  }}
                  category={post.category}
                  readTime={`${post.estimated_read_time || 5} min read`}
                  date={new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  image={post.cover_image_url || ''}
                  slug={post.slug}
                  trending={post.trending}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-12 text-center">
              <h3 className="text-xl font-bold text-white mb-2">No Articles Yet</h3>
              <p className="text-gray-400">
                Configure your Supabase connection to load articles. See SETUP_GUIDE.md for details.
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
