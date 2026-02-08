import Navbar from '@/components/Navbar'
import ArticleCard from '@/components/ArticleCard'
import { BookOpen, Filter, Search } from 'lucide-react'
import { getPosts } from '@/lib/actions/posts'

export default async function ArticlesPage() {
  const posts = await getPosts({ status: 'published', limit: 20 })

  return (
    <main className="min-h-screen bg-deep-charcoal">
      <Navbar />
      
      <div className="container mx-auto px-6 pt-32 pb-20">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white via-electric-cyan to-cyber-lime bg-clip-text text-transparent">
              All Articles
            </span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed">
            Explore our comprehensive collection of DevOps, Platform Engineering, and Cloud Native content
          </p>
        </div>

        {/* Search and Filter */}
        <div className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-electric-cyan/50"
            />
          </div>
          <button className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>

        {/* Articles Grid */}
        {posts.length > 0 ? (
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((article) => (
              <ArticleCard
                key={article.id}
                title={article.title}
                excerpt={article.excerpt}
                author={{
                  name: article.author?.full_name || 'Anonymous',
                  avatar: article.author?.avatar_url || '/avatars/default.png',
                  role: article.author?.role || 'Contributor',
                }}
                category={article.category}
                readTime={`${article.read_time} min read`}
                date={new Date(article.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                image={article.cover_image_url || '/blog/default.jpg'}
                slug={article.slug}
                trending={article.trending}
              />
            ))}
          </div>
        ) : (
          <div className="max-w-7xl mx-auto rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Articles Yet</h3>
            <p className="text-gray-400 mb-4">Check back soon for exciting DevOps content!</p>
            <p className="text-sm text-electric-cyan">💡 Configure Supabase to load real posts (see SETUP_GUIDE.md)</p>
          </div>
        )}
      </div>
    </main>
  )
}
