import Navbar from '@/components/Navbar'
import ArticleCard from '@/components/ArticleCard'
import { ArrowLeft, Filter } from 'lucide-react'
import Link from 'next/link'
import { getPosts } from '@/lib/actions/posts'

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const category = params.category
  const categoryName = category.charAt(0).toUpperCase() + category.slice(1)
  
  // Fetch posts for this category
  const posts = await getPosts({ category: categoryName, status: 'published' })
  
  return (
    <main className="min-h-screen bg-deep-charcoal">
      <Navbar />
      
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-mesh-gradient opacity-20" />
        <div className="absolute top-20 left-20 w-96 h-96 bg-electric-cyan/10 rounded-full blur-3xl" />
        
        <div className="relative container mx-auto px-6">
          {/* Breadcrumb */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-electric-cyan transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          
          {/* Header */}
          <div className="max-w-4xl mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white via-electric-cyan to-cyber-lime bg-clip-text text-transparent">
                {categoryName}
              </span>
            </h1>
            <p className="text-xl text-gray-400">
              Explore in-depth articles, tutorials, and best practices for {categoryName}.
            </p>
          </div>
          
          {/* Filters */}
          <div className="flex items-center gap-4 mb-8">
            <button className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <div className="flex gap-2">
              {['All', 'Beginner', 'Intermediate', 'Advanced'].map((level) => (
                <button
                  key={level}
                  className={`px-4 py-2 rounded-xl transition-colors ${
                    level === 'All'
                      ? 'bg-electric-cyan/20 text-electric-cyan'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
          
          {/* Articles Grid */}
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <ArticleCard
                  key={post.id}
                  title={post.title}
                  excerpt={post.excerpt}
                  author={{
                    name: post.author?.full_name || 'Anonymous',
                    avatar: post.author?.avatar_url || '/avatars/default.png',
                    role: post.author?.role || 'Contributor',
                  }}
                  category={post.category}
                  readTime={`${post.read_time} min read`}
                  date={new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  image={post.cover_image_url || '/blog/default.jpg'}
                  slug={post.slug}
                  trending={post.trending}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-12 text-center">
              <h3 className="text-xl font-bold text-white mb-2">No Articles Yet</h3>
              <p className="text-gray-400 mb-4">
                We're working on adding great content for {categoryName}. Check back soon!
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-electric-cyan/20 text-electric-cyan hover:bg-electric-cyan/30 transition-colors"
              >
                Explore Other Categories
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
