import Navbar from '@/components/Navbar'
import ArticleCard from '@/components/ArticleCard'
import Footer from '@/components/Footer'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getPosts } from '@/lib/actions/posts'

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params

  const slugToName: Record<string, string> = {
    'kubernetes': 'Kubernetes',
    'platform-engineering': 'Platform Engineering',
    'terraform': 'Terraform',
    'cicd': 'CI/CD',
    'security': 'Security',
    'cloud_native': 'Cloud Native',
    'observability': 'Observability',
    'aws': 'AWS',
    'azure': 'Azure',
    'gcp': 'GCP',
    'docker': 'Docker',
    'monitoring': 'Monitoring',
  }
  const categoryName = slugToName[category] || category.charAt(0).toUpperCase() + category.slice(1)

  const posts = await getPosts({ category, status: 'published' })

  return (
    <main className="min-h-screen bg-deep-charcoal">
      <Navbar />

      <section className="relative pt-28 pb-20 overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-30" />
        <div className="absolute top-20 left-20 w-[400px] h-[400px] bg-electric-cyan/[0.03] rounded-full blur-[120px]" />

        <div className="relative container mx-auto px-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-electric-cyan transition-colors mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Articles
          </Link>

          <div className="max-w-3xl mb-10">
            <p className="text-xs text-electric-cyan uppercase tracking-widest font-medium mb-3">Category</p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">{categoryName}</h1>
            <p className="text-sm text-gray-500">
              Explore in-depth articles, tutorials, and best practices for {categoryName}.
            </p>
          </div>

          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map((post) => (
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
                  readTime={`${post.estimated_read_time || 5} min`}
                  date={new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  image={post.cover_image_url || ''}
                  slug={post.slug}
                  trending={post.trending}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-10 text-center">
              <h3 className="text-base font-semibold text-white mb-1">No Articles Yet</h3>
              <p className="text-sm text-gray-500 mb-4">
                We&apos;re working on adding great content for {categoryName}.
              </p>
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-sm text-electric-cyan font-medium hover:text-electric-cyan/80 transition-colors"
              >
                Browse All Articles <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
              </Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
