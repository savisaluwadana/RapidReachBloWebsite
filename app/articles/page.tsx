import Navbar from '@/components/Navbar'
import ArticleCard from '@/components/ArticleCard'
import Footer from '@/components/Footer'
import { BookOpen, Search, ArrowLeft } from 'lucide-react'
import { getContentPosts, getBuiltInContentStats } from '@/lib/content/content-service'
import Link from 'next/link'

const allCategories = [
  'All',
  'Kubernetes',
  'Platform Engineering',
  'Terraform',
  'CI/CD',
  'GitOps',
  'SRE',
  'Observability',
  'Security',
  'Networking',
  'AWS',
  'Docker',
  'Go',
  'Distributed Systems',
  'AI Infrastructure',
]

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>
}) {
  const { category, q } = await searchParams
  const activeCategory = category || null
  const query = q?.trim().toLowerCase() || ''

  const allPosts = await getContentPosts({
    status: 'published',
    limit: 80,
    ...(activeCategory ? { category: activeCategory } : {}),
  })

  const posts = query
    ? allPosts.filter((post) => {
        const haystack = [post.title, post.excerpt, post.category, ...post.categories, ...post.tags]
          .join(' ')
          .toLowerCase()
        return haystack.includes(query)
      })
    : allPosts

  const stats = getBuiltInContentStats()

  return (
    <main className="min-h-screen bg-deep-charcoal">
      <Navbar />

      <div className="container mx-auto px-6 pt-32 pb-20">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.07] text-xs text-gray-400 mb-5">
            <BookOpen className="w-3.5 h-3.5 text-electric-cyan" />
            {stats.articles}+ production-focused guides · {stats.learningPaths} learning paths · {stats.categories} domains
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white via-electric-cyan to-cyber-lime bg-clip-text text-transparent">
              {activeCategory ? activeCategory : 'Engineering Library'}
            </span>
          </h1>
          <p className="text-lg text-gray-400 leading-relaxed max-w-3xl mx-auto">
            {activeCategory
              ? `Production mental models, debugging patterns, and hands-on exercises for ${activeCategory}.`
              : 'A practical knowledge base for cloud-native engineers: architecture, failure modes, debugging, reliability, security, and platform operations.'}
          </p>
        </div>

        <div className="max-w-7xl mx-auto mb-8 flex flex-wrap items-center gap-2">
          {allCategories.map((cat) => {
            const isActive = cat === 'All' ? !activeCategory : activeCategory === cat
            return (
              <Link
                key={cat}
                href={cat === 'All' ? '/articles' : `/articles?category=${encodeURIComponent(cat)}`}
                className={`px-4 py-2 rounded-lg font-medium text-xs transition-all ${
                  isActive
                    ? 'bg-electric-cyan/15 text-electric-cyan border border-electric-cyan/25'
                    : 'bg-white/[0.025] text-gray-500 hover:text-white hover:bg-white/[0.05] border border-white/[0.06]'
                }`}
              >
                {cat}
              </Link>
            )
          })}
        </div>

        <form className="max-w-7xl mx-auto mb-10" action="/articles" method="get">
          {activeCategory && <input type="hidden" name="category" value={activeCategory} />}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="search"
              name="q"
              defaultValue={q || ''}
              placeholder="Search Kubernetes, Cilium, SLOs, Terraform, MCP, Go..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.025] border border-white/[0.07] text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-electric-cyan/50"
            />
          </div>
        </form>

        {posts.length > 0 ? (
          <>
            <div className="max-w-7xl mx-auto flex items-center justify-between mb-5">
              <p className="text-xs text-gray-600">{posts.length} article{posts.length === 1 ? '' : 's'} available</p>
              {query && <p className="text-xs text-gray-500">Search: “{q}”</p>}
            </div>
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((article) => (
                <ArticleCard
                  key={article.id}
                  title={article.title}
                  excerpt={article.excerpt}
                  author={{
                    name: article.author?.full_name || 'RapidReach Engineering',
                    avatar: article.author?.avatar_url || '',
                    role: article.author?.role || 'Engineering',
                  }}
                  category={article.category}
                  categories={article.categories}
                  readTime={`${article.estimated_read_time || 5} min read`}
                  date={new Date(article.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  image={article.cover_image_url || ''}
                  slug={article.slug}
                  trending={article.trending}
                  featured={article.featured}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="max-w-7xl mx-auto rounded-2xl bg-white/[0.025] border border-white/[0.07] p-12 text-center">
            <BookOpen className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No matching articles</h3>
            <p className="text-sm text-gray-500 mb-6">Try another engineering domain or clear the current search.</p>
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-electric-cyan/15 text-electric-cyan hover:bg-electric-cyan/25 transition-colors text-sm font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              View the full library
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}
