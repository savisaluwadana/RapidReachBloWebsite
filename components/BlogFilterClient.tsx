'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, TrendingUp, Clock, Zap, X } from 'lucide-react'
import ArticleCard from '@/components/ArticleCard'
import { searchPosts } from '@/lib/actions/posts'
import type { Post } from '@/lib/types/database'

interface BlogFilterClientProps {
  initialPosts: Post[]
}

type SortOption = 'latest' | 'trending' | 'popular'

export default function BlogFilterClient({ initialPosts }: BlogFilterClientProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('latest')
  const [isSearching, setIsSearching] = useState(false)
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Sort posts based on selected option
  const sortPosts = useCallback((postsToSort: Post[], sort: SortOption) => {
    const sorted = [...postsToSort]
    switch (sort) {
      case 'trending':
        return sorted.sort((a, b) => {
          if (a.trending && !b.trending) return -1
          if (!a.trending && b.trending) return 1
          return (b.view_count || 0) - (a.view_count || 0)
        })
      case 'popular':
        return sorted.sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
      case 'latest':
      default:
        return sorted.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
    }
  }, [])

  // Handle search with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setPosts(sortPosts(initialPosts, sortBy))
      setIsSearching(false)
      return
    }

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current)
    }

    setIsSearching(true)
    searchTimerRef.current = setTimeout(async () => {
      try {
        const results = await searchPosts(searchQuery, 50)
        setPosts(sortPosts(results, sortBy))
      } catch (error) {
        console.error('Search error:', error)
        // Fall back to client-side filtering
        const filtered = initialPosts.filter(
          (post) =>
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        setPosts(sortPosts(filtered, sortBy))
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current)
      }
    }
  }, [searchQuery, initialPosts, sortBy, sortPosts])

  // Handle sort change
  useEffect(() => {
    setPosts((currentPosts) => sortPosts(currentPosts, sortBy))
  }, [sortBy, sortPosts])

  const clearSearch = () => {
    setSearchQuery('')
  }

  return (
    <>
      {/* Search Bar */}
      <div className="relative max-w-xl mx-auto mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search articles by title, content, or tags..."
          className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-electric-cyan/50 focus:border-electric-cyan/30 transition-all"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
        {isSearching && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-electric-cyan border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-600">Sort:</span>
          {[
            { label: 'Latest', value: 'latest' as SortOption, icon: Clock },
            { label: 'Trending', value: 'trending' as SortOption, icon: TrendingUp },
            { label: 'Popular', value: 'popular' as SortOption, icon: Zap },
          ].map((sort) => (
            <button
              key={sort.value}
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
        
        {searchQuery && (
          <div className="ml-auto text-xs text-gray-600">
            {posts.length} result{posts.length !== 1 ? 's' : ''} for &ldquo;{searchQuery}&rdquo;
          </div>
        )}
      </div>

      {/* Articles Grid */}
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
              date={new Date(post.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
              image={post.cover_image_url || ''}
              slug={post.slug}
              trending={post.trending}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-10 text-center">
          <Search className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white mb-1">No Articles Found</h3>
          <p className="text-sm text-gray-500">
            {searchQuery
              ? `No articles match "${searchQuery}". Try a different search term.`
              : 'No articles available yet. Check back soon!'}
          </p>
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="mt-3 text-xs text-electric-cyan font-medium hover:text-electric-cyan/80 transition-colors"
            >
              Clear Search
            </button>
          )}
        </div>
      )}
    </>
  )
}
