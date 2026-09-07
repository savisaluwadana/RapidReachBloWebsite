'use client'

import { useMemo, useState } from 'react'
import { Search, TrendingUp, Clock, Zap, X } from 'lucide-react'
import ArticleCard from '@/components/ArticleCard'
import type { Post } from '@/lib/types/database'

interface BlogFilterClientProps {
  initialPosts: Post[]
}

type SortOption = 'latest' | 'trending' | 'popular'

const CATEGORIES = [
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

export default function BlogFilterClient({ initialPosts }: BlogFilterClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('latest')
  const [activeCategory, setActiveCategory] = useState('All')

  const posts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    const category = activeCategory.toLowerCase()

    const filtered = initialPosts.filter((post) => {
      const postCategories = [post.category, ...(post.categories || [])].map((value) => value.toLowerCase())
      const categoryMatches = activeCategory === 'All' || postCategories.some((value) => value === category)
      if (!categoryMatches) return false

      if (!query) return true
      const haystack = [post.title, post.excerpt, post.content, post.category, ...(post.categories || []), ...(post.tags || [])]
        .join(' ')
        .toLowerCase()
      return haystack.includes(query)
    })

    return [...filtered].sort((a, b) => {
      if (sortBy === 'trending') {
        if (a.trending && !b.trending) return -1
        if (!a.trending && b.trending) return 1
        return (b.view_count || 0) - (a.view_count || 0)
      }
      if (sortBy === 'popular') {
        return (b.view_count || 0) - (a.view_count || 0) || (b.like_count || 0) - (a.like_count || 0)
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [initialPosts, searchQuery, sortBy, activeCategory])

  return (
    <>
      <div className="relative max-w-2xl mx-auto mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search Kubernetes, Cilium, Terraform, SLOs, Go, MCP..."
          className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-electric-cyan/50 focus:border-electric-cyan/30 transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-white/[0.06] transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-5 justify-center">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActiveCategory(category)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeCategory === category
                ? 'bg-electric-cyan/10 text-electric-cyan border border-electric-cyan/20'
                : 'bg-white/[0.02] text-gray-500 border border-white/[0.04] hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-600">Sort:</span>
          {[
            { label: 'Latest', value: 'latest' as SortOption, icon: Clock },
            { label: 'Trending', value: 'trending' as SortOption, icon: TrendingUp },
            { label: 'Popular', value: 'popular' as SortOption, icon: Zap },
          ].map((sort) => (
            <button
              key={sort.value}
              type="button"
              onClick={() => setSortBy(sort.value)}
              className={`px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs ${
                sortBy === sort.value
                  ? 'bg-electric-cyan/10 text-electric-cyan border border-electric-cyan/20'
                  : 'bg-white/[0.03] text-gray-500 hover:bg-white/[0.06] border border-transparent'
              }`}
            >
              <sort.icon className="w-3.5 h-3.5" />
              {sort.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-600">
          {posts.length} article{posts.length === 1 ? '' : 's'}
          {searchQuery ? ` matching “${searchQuery}”` : ''}
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
                name: post.author?.full_name || 'RapidReach Engineering',
                avatar: post.author?.avatar_url || '',
                role: post.author?.role || 'Engineering',
              }}
              category={post.category}
              categories={post.categories}
              readTime={`${post.estimated_read_time || 5} min`}
              date={new Date(post.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
              image={post.cover_image_url || ''}
              slug={post.slug}
              trending={post.trending}
              featured={post.featured}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-10 text-center">
          <Search className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white mb-1">No matching articles</h3>
          <p className="text-sm text-gray-500">Try a broader search term or another engineering domain.</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('')
              setActiveCategory('All')
            }}
            className="mt-3 text-xs text-electric-cyan font-medium hover:text-electric-cyan/80 transition-colors"
          >
            Clear filters
          </button>
        </div>
      )}
    </>
  )
}
