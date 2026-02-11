import Navbar from '@/components/Navbar'
import ArticleCard from '@/components/ArticleCard'
import { BookOpen, Filter, Search, ArrowLeft } from 'lucide-react'
import { getPosts } from '@/lib/actions/posts'
import Link from 'next/link'

const allCategories = ['All', 'Kubernetes', 'Platform Engineering', 'Terraform', 'CI/CD', 'Security', 'Cloud Native', 'GitOps', 'Docker', 'AWS']

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const activeCategory = category || null

  const posts = await getPosts({
    status: 'published',
    limit: 30,
    ...(activeCategory ? { category: activeCategory } : {}),
  })

  return (
    <main className="min-h-screen bg-deep-charcoal">
      <Navbar />
      
      <div className="container mx-auto px-6 pt-32 pb-20">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white via-electric-cyan to-cyber-lime bg-clip-text text-transparent">
              {activeCategory ? activeCategory : 'All Articles'}
            </span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed">
            {activeCategory
              ? `Explore in-depth articles, tutorials, and best practices for ${activeCategory}`
              : 'Explore our comprehensive collection of DevOps, Platform Engineering, and Cloud Native content'}
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="max-w-7xl mx-auto mb-10 flex flex-wrap items-center gap-3">
          {allCategories.map((cat) => {
            const isActive = cat === 'All' ? !activeCategory : activeCategory === cat
            return (
              <Link
                key={cat}
                href={cat === 'All' ? '/articles' : `/articles?category=${encodeURIComponent(cat)}`}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  isActive
                    ? 'bg-electric-cyan/20 text-electric-cyan border border-electric-cyan/30'
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                {cat}
              </Link>
            )
          })}
        </div>

        {/* Search */}
        <div className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-electric-cyan/50"
            />
          </div>
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
                readTime={`${article.estimated_read_time || 5} min read`}
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
            <h3 className="text-xl font-bold text-white mb-2">
              {activeCategory ? `No ${activeCategory} Articles Yet` : 'No Articles Yet'}
            </h3>
            <p className="text-gray-400 mb-6">
              {activeCategory 
                ? `We're working on adding great content for ${activeCategory}. Check back soon!`
                : 'Check back soon for exciting DevOps content!'}
            </p>
            {activeCategory && (
              <Link
                href="/articles"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-electric-cyan/20 text-electric-cyan hover:bg-electric-cyan/30 transition-colors font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                View All Articles
              </Link>
            )}
            {!activeCategory && (
              <p className="text-sm text-electric-cyan">💡 Configure Supabase to load real posts (see SETUP_GUIDE.md)</p>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
