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
      <div className="relative max-w-2xl mx-auto mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search articles by title, content, or tags..."
          className="w-full pl-12 pr-12 py-4 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-electric-cyan/50 transition-all"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        )}
        {isSearching && (
          <div className="absolute right-14 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-electric-cyan border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Sort by:</span>
          {[
            { label: 'Latest', value: 'latest' as SortOption, icon: Clock },
            { label: 'Trending', value: 'trending' as SortOption, icon: TrendingUp },
            { label: 'Popular', value: 'popular' as SortOption, icon: Zap },
          ].map((sort) => (
            <button
              key={sort.value}
              onClick={() => setSortBy(sort.value)}
              className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
                sortBy === sort.value
                  ? 'bg-electric-cyan/20 text-electric-cyan border border-electric-cyan/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-transparent'
              }`}
            >
              <sort.icon className="w-4 h-4" />
              {sort.label}
            </button>
          ))}
        </div>
        
        {searchQuery && (
          <div className="ml-auto text-gray-400 text-sm">
            Found {posts.length} result{posts.length !== 1 ? 's' : ''} for "{searchQuery}"
          </div>
        )}
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
                avatar: post.author?.avatar_url || '',
                role: post.author?.role || 'Contributor',
              }}
              category={post.category}
              readTime={`${post.estimated_read_time || 5} min read`}
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
        <div className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-12 text-center">
          <Search className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Articles Found</h3>
          <p className="text-gray-400">
            {searchQuery
              ? `No articles match "${searchQuery}". Try a different search term.`
              : 'No articles available yet. Check back soon!'}
          </p>
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="mt-4 px-6 py-2 rounded-lg bg-electric-cyan/20 text-electric-cyan hover:bg-electric-cyan/30 transition-colors"
            >
              Clear Search
            </button>
          )}
        </div>
      )}
    </>
  )
}
