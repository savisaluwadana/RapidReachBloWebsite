import Navbar from '@/components/Navbar'
import ArticleCard from '@/components/ArticleCard'
import Footer from '@/components/Footer'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getContentPosts } from '@/lib/content/content-service'

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params

  const slugToName: Record<string, string> = {
    kubernetes: 'Kubernetes',
    'platform-engineering': 'Platform Engineering',
    terraform: 'Terraform',
    cicd: 'CI/CD',
    gitops: 'GitOps',
    security: 'Security',
    cloud_native: 'Cloud Native',
    cloud: 'Cloud',
    observability: 'Observability',
    sre: 'SRE',
    networking: 'Networking',
    aws: 'AWS',
    azure: 'Azure',
    gcp: 'GCP',
    docker: 'Docker',
    go: 'Go',
    'distributed-systems': 'Distributed Systems',
    'ai-infrastructure': 'AI Infrastructure',
    monitoring: 'Observability',
  }
  const categoryName = slugToName[category] || category.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')

  const posts = await getContentPosts({ category: categoryName, status: 'published', limit: 80 })

  return (
    <main className="min-h-screen bg-deep-charcoal">
      <Navbar />

      <section className="relative pt-28 pb-20 overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-30" />
        <div className="absolute top-20 left-20 w-[400px] h-[400px] bg-electric-cyan/[0.03] rounded-full blur-[120px]" />

        <div className="relative container mx-auto px-6">
          <Link
            href="/articles"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-electric-cyan transition-colors mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Engineering Library
          </Link>

          <div className="max-w-3xl mb-10">
            <p className="text-xs text-electric-cyan uppercase tracking-widest font-medium mb-3">Engineering Domain</p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">{categoryName}</h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              Production mental models, architecture, failure modes, debugging patterns, and hands-on exercises for {categoryName}.
            </p>
            <p className="text-xs text-gray-600 mt-3">{posts.length} guide{posts.length === 1 ? '' : 's'} in this domain</p>
          </div>

          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map((post) => (
                <ArticleCard
                  key={post.id}
                  title={post.title}
                  excerpt={post.excerpt}
                  author={{
                    name: post.author?.full_name || 'RapidReach Engineering',
                    avatar: post.author?.avatar_url || '',
                    role: post.author?.role || 'Engineering',
                  }}
                  category={post.category}
                  categories={post.categories}
                  readTime={`${post.estimated_read_time || 5} min`}
                  date={new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  image={post.cover_image_url || ''}
                  slug={post.slug}
                  trending={post.trending}
                  featured={post.featured}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-10 text-center">
              <h3 className="text-base font-semibold text-white mb-1">No matching guides yet</h3>
              <p className="text-sm text-gray-500 mb-4">Explore the full engineering library while this domain expands.</p>
              <Link
                href="/articles"
                className="inline-flex items-center gap-1.5 text-sm text-electric-cyan font-medium hover:text-electric-cyan/80 transition-colors"
              >
                Browse all articles <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
              </Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
