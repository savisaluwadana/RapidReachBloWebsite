import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import ReadingProgress from '@/components/ReadingProgress'
import ArticleActions from '@/components/ArticleActions'
import CommentsSection from '@/components/CommentsSection'
import Footer from '@/components/Footer'
import { Calendar, Clock, User, TrendingUp } from 'lucide-react'
import { getPostBySlug, incrementPostView } from '@/lib/actions/posts'
import { formatCategory } from '@/lib/utils'
import MarkdownContent from './MarkdownContent'

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  incrementPostView(post.id).catch(console.error)

  return (
    <>
      <ReadingProgress />
      <Navbar />

      <main className="min-h-screen bg-deep-charcoal pt-24 pb-20">
        <article className="max-w-5xl mx-auto px-6">
          {/* Header */}
          <div className="max-w-3xl mx-auto mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-0.5 rounded bg-electric-cyan/10 text-electric-cyan text-[10px] font-semibold uppercase tracking-wider">
                {formatCategory(post.category)}
              </span>
              {post.trending && (
                <span className="px-2 py-0.5 rounded bg-cyber-lime/10 text-cyber-lime text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Trending
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-6">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span className="font-medium text-gray-400">{post.author?.full_name || 'Anonymous'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{post.estimated_read_time} min read</span>
              </div>
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-6">
                {post.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded bg-white/[0.03] text-gray-500 text-[10px] font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {post.cover_image_url && (
              <div className="aspect-video rounded-xl overflow-hidden bg-white/[0.02] mb-8">
                <img
                  src={post.cover_image_url}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Content Grid */}
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_60px] gap-10">
            <div className="max-w-3xl">
              <div className="prose prose-invert prose-lg max-w-none">
                <MarkdownContent content={post.content} />
              </div>

              {post.author && (
                <div className="mt-14 p-6 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-electric-cyan flex-shrink-0 flex items-center justify-center text-white font-bold">
                      {post.author.full_name?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-1">{post.author.full_name}</h3>
                      {post.author.bio && (
                        <p className="text-xs text-gray-500 leading-relaxed mb-2">{post.author.bio}</p>
                      )}
                      <span className="text-[10px] text-gray-600 uppercase tracking-wider">{post.author.role || 'Contributor'}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-14">
                <CommentsSection postId={post.id} />
              </div>
            </div>

            <div className="hidden lg:block">
              <ArticleActions postId={post.id} title={post.title} />
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </>
  )
}
