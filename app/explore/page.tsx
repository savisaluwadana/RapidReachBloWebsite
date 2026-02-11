import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ArticleCard from '@/components/ArticleCard'
import { getPosts } from '@/lib/actions/posts'
import { getNewsFeed } from '@/lib/actions/news'
import { getLearningPaths } from '@/lib/actions/learning-paths'
import { 
  TrendingUp, 
  Zap, 
  BookOpen, 
  Newspaper, 
  ArrowRight, 
  Clock, 
  Users,
  Star,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'

export default async function ExplorePage() {
  // Fetch all content types
  const [featuredPosts, trendingPosts, recentPosts, newsFeed, learningPaths] = await Promise.all([
    getPosts({ featured: true, status: 'published', limit: 2 }),
    getPosts({ trending: true, status: 'published', limit: 4 }),
    getPosts({ status: 'published', limit: 6 }),
    getNewsFeed({ limit: 4 }),
    getLearningPaths(),
  ])

  return (
    <main className="min-h-screen bg-deep-charcoal">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-mesh-gradient opacity-30" />
        <div className="absolute top-20 left-20 w-96 h-96 bg-electric-cyan/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyber-lime/10 rounded-full blur-3xl" />

        <div className="relative container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-cyber text-white text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              Discover Amazing Content
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white via-electric-cyan to-cyber-lime bg-clip-text text-transparent">
                Explore RapidReach
              </span>
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto">
              Dive into our comprehensive collection of DevOps content, real-time news, 
              and structured learning paths designed for modern cloud practitioners.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 border-y border-white/10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-electric-cyan mb-2">{recentPosts.length}+</p>
              <p className="text-gray-400">Articles</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-cyber-lime mb-2">{learningPaths.length}+</p>
              <p className="text-gray-400">Learning Paths</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-electric-cyan mb-2">{newsFeed.length}+</p>
              <p className="text-gray-400">News Updates</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-cyber-lime mb-2">10+</p>
              <p className="text-gray-400">Categories</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      {featuredPosts.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Star className="w-6 h-6 text-cyber-lime" />
                <h2 className="text-3xl font-bold text-white">Featured Articles</h2>
              </div>
              <Link
                href="/blog"
                className="flex items-center gap-2 text-electric-cyan hover:text-cyber-lime transition-colors"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredPosts.map((post) => (
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
                  featured
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trending Now */}
      <section className="py-16 bg-white/[0.02]">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-cyber-lime" />
              <h2 className="text-3xl font-bold text-white">Trending Now</h2>
            </div>
            <Link
              href="/blog?sort=trending"
              className="flex items-center gap-2 text-electric-cyan hover:text-cyber-lime transition-colors"
            >
              See More
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingPosts.map((post) => (
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
                trending
              />
            ))}
          </div>
        </div>
      </section>

      {/* Learning Paths Preview */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-electric-cyan" />
              <h2 className="text-3xl font-bold text-white">Learning Paths</h2>
            </div>
            <Link
              href="/learning-paths"
              className="flex items-center gap-2 text-electric-cyan hover:text-cyber-lime transition-colors"
            >
              View All Paths
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningPaths.slice(0, 3).map((path) => (
              <Link
                key={path.id}
                href={`/learning-paths/${path.slug}`}
                className="group rounded-2xl bg-white/5 border border-white/10 p-6 hover:bg-white/10 hover:border-electric-cyan/50 transition-all"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 rounded-lg bg-electric-cyan/10 text-electric-cyan text-sm font-semibold">
                    {path.difficulty}
                  </span>
                  <span className="flex items-center gap-1 text-gray-400 text-sm">
                    <Clock className="w-4 h-4" />
                    {path.estimated_duration ? `${Math.ceil(path.estimated_duration / 40)} weeks` : 'Self-paced'}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-electric-cyan transition-colors">
                  {path.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{path.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-500 text-sm">
                    <BookOpen className="w-4 h-4" />
                    {path.modules.length} modules
                  </span>
                  <span className="flex items-center gap-2 text-gray-500 text-sm">
                    <Users className="w-4 h-4" />
                    {path.enrollment_count.toLocaleString()} enrolled
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section className="py-16 bg-white/[0.02]">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Newspaper className="w-6 h-6 text-cyber-lime" />
              <h2 className="text-3xl font-bold text-white">Latest News</h2>
            </div>
            <Link
              href="/news"
              className="flex items-center gap-2 text-electric-cyan hover:text-cyber-lime transition-colors"
            >
              All News
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {newsFeed.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="rounded-2xl bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 rounded-lg bg-electric-cyan/10 text-electric-cyan text-sm font-semibold">
                    {item.category}
                  </span>
                  <span className="text-gray-400 text-sm">{item.source}</span>
                  {item.is_breaking && (
                    <span className="flex items-center gap-1 text-cyber-lime text-sm">
                      <Zap className="w-4 h-4" />
                      Breaking
                    </span>
                  )}
                </div>
                
                <h3 className="text-lg font-bold text-white mb-2 hover:text-electric-cyan transition-colors">
                  {item.url ? (
                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                      {item.title}
                    </a>
                  ) : (
                    item.title
                  )}
                </h3>
                
                <p className="text-gray-400 text-sm line-clamp-2">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by Category */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Browse by Category</h2>
            <p className="text-gray-400">Find content tailored to your interests</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Kubernetes', icon: '☸️', href: '/category/kubernetes' },
              { name: 'Terraform', icon: '🔷', href: '/category/terraform' },
              { name: 'CI/CD', icon: '🔄', href: '/category/cicd' },
              { name: 'Security', icon: '🔒', href: '/category/security' },
              { name: 'AWS', icon: '☁️', href: '/category/aws' },
              { name: 'Observability', icon: '📊', href: '/category/observability' },
            ].map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="group rounded-2xl bg-white/5 border border-white/10 p-6 text-center hover:bg-white/10 hover:border-electric-cyan/50 transition-all hover:scale-105"
              >
                <span className="text-4xl mb-3 block group-hover:scale-110 transition-transform">
                  {category.icon}
                </span>
                <span className="text-white font-semibold">{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-electric-cyan/10 to-cyber-lime/10" />
        <div className="relative container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Level Up?</h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of DevOps engineers who are mastering cloud-native technologies with RapidReach.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="px-8 py-4 rounded-xl bg-gradient-cyber text-white font-semibold shadow-glow-lg hover:shadow-glow-xl transition-all hover:scale-105"
            >
              Get Started Free
            </Link>
            <Link
              href="/subscribe"
              className="px-8 py-4 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-all"
            >
              Subscribe to Newsletter
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
