import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import ReadingProgress from '@/components/ReadingProgress'
import ArticleActions from '@/components/ArticleActions'
import CommentsSection from '@/components/CommentsSection'
import { Calendar, Clock, User, Tag, TrendingUp } from 'lucide-react'
import { getPostBySlug, incrementPostView } from '@/lib/actions/posts'
import { formatCategory } from '@/lib/utils'
import MarkdownContent from './MarkdownContent'

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  // Increment view count (non-blocking)
  incrementPostView(post.id).catch(console.error)

  return (
    <>
      <ReadingProgress />
      <Navbar />
      
      <main className="min-h-screen bg-deep-charcoal pt-24 pb-20">
        <article className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="max-w-4xl mx-auto mb-12">
            {/* Category & Trending Badge */}
            <div className="flex items-center gap-3 mb-6">
              <span className="px-4 py-2 rounded-lg bg-electric-cyan/20 text-electric-cyan font-semibold text-sm">
                {formatCategory(post.category)}
              </span>
              {post.trending && (
                <span className="px-4 py-2 rounded-lg bg-cyber-lime/20 text-cyber-lime font-semibold text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Trending
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-6 text-gray-400 mb-8">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span className="font-semibold">{post.author?.full_name || 'Anonymous'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{post.estimated_read_time} min read</span>
              </div>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-white/5 text-gray-300 text-sm hover:bg-white/10 transition-colors cursor-pointer">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Cover Image */}
            {post.cover_image_url && (
              <div className="aspect-video rounded-2xl overflow-hidden bg-gradient-mesh relative mb-8">
                <img 
                  src={post.cover_image_url} 
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Content Grid */}
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_80px] gap-12">
            {/* Main Content */}
            <div className="max-w-4xl">
              <div className="prose prose-invert prose-lg max-w-none">
                <MarkdownContent content={post.content} />
              </div>

              {/* Author Bio */}
              {post.author && (
                <div className="mt-16 p-8 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-cyber flex-shrink-0" />
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{post.author.full_name}</h3>
                      {post.author.bio && (
                        <p className="text-gray-400 leading-relaxed mb-3">{post.author.bio}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{post.author.role || 'Contributor'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Comments Section */}
              <div className="mt-16">
                <CommentsSection postId={post.id} />
              </div>
            </div>

            {/* Sidebar Actions */}
            <div className="hidden lg:block">
              <ArticleActions />
            </div>
          </div>
        </article>
      </main>
    </>
  )
}
