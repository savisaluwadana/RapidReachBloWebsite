'use server'

import { createClient, createCachedClient } from '@/lib/supabase/server'
import { Post, UserProfile } from '@/lib/types/database'
import { revalidatePath, unstable_cache } from 'next/cache'
import { checkRateLimit, RATE_LIMITS } from '@/lib/utils/rate-limit'

// =====================================================
// POST ACTIONS
// =====================================================

// Category-to-domain mapping for counting articles per learning domain
const DOMAIN_CATEGORIES: Record<string, string[]> = {
  'Container Orchestration': ['kubernetes', 'docker', 'containers', 'containerd', 'podman'],
  'Infrastructure as Code': ['terraform', 'pulumi', 'cloudformation', 'crossplane', 'iac'],
  'CI/CD & GitOps': ['cicd', 'ci-cd', 'github-actions', 'argocd', 'gitops', 'flux', 'jenkins'],
  'Service Mesh & Networking': ['service-mesh', 'istio', 'envoy', 'cilium', 'linkerd', 'networking'],
  'Cloud Platforms': ['cloud', 'aws', 'gcp', 'azure', 'digitalocean'],
  'Observability & SRE': ['observability', 'prometheus', 'grafana', 'sre', 'monitoring', 'tracing'],
  'Security & Compliance': ['security', 'vault', 'falco', 'opa', 'trivy', 'devsecops'],
  'Platform Engineering': ['platform-engineering', 'backstage', 'idp', 'developer-experience'],
}

// ─── Cached inner implementation (5-minute revalidation) ────────────────────
const _getSiteStatsInner = unstable_cache(
  async () => {
    const supabase = createCachedClient()
    if (!supabase) return { totalPosts: 0, totalUsers: 0, domainCounts: {} as Record<string, number> }
    try {
      const { count: totalPosts } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published')
      const { count: totalUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
      const { data: posts } = await supabase
        .from('posts')
        .select('category, categories')
        .eq('status', 'published')
      const domainCounts: Record<string, number> = {}
      for (const [domain, cats] of Object.entries(DOMAIN_CATEGORIES)) {
        domainCounts[domain] = (posts || []).filter((p: { category?: string | null; categories?: string[] | null }) => {
          const allCats = [
            ...(Array.isArray(p.categories) && p.categories.length ? p.categories : []),
            p.category,
          ].filter(Boolean).map(c => c!.toLowerCase())
          return cats.some(c => allCats.some(ac => ac.includes(c)))
        }).length
      }
      return { totalPosts: totalPosts || 0, totalUsers: totalUsers || 0, domainCounts }
    } catch (error) {
      console.error('Error fetching site stats:', error)
      return { totalPosts: 0, totalUsers: 0, domainCounts: {} as Record<string, number> }
    }
  },
  ['site-stats'],
  { revalidate: 300, tags: ['stats'] }
)

export async function getSiteStats() {
  return _getSiteStatsInner()
}

// ─── Cached inner implementation — keyed by serialised options (60s revalidation) ─
const _getPostsInner = unstable_cache(
  async (optionsKey: string) => {
    const options = JSON.parse(optionsKey) as {
      status?: string
      category?: string
      authorId?: string
      featured?: boolean
      trending?: boolean
      limit?: number
      offset?: number
    }
    const supabase = createCachedClient()
    if (!supabase) {
      console.warn('⚠️  Supabase not configured. Check SETUP_GUIDE.md.')
      return [] as Post[]
    }
    let query = supabase
      .from('posts')
      .select(`
        *,
        author:user_profiles!posts_author_id_fkey(*)
      `)
      .order('created_at', { ascending: false })
    if (options?.status) query = query.eq('status', options.status)
    if (options?.category) {
      // Match on primary category enum OR categories array (if column exists)
      query = query.or(`category.eq.${options.category},categories.cs.{${options.category}}`)
    }
    if (options?.authorId) query = query.eq('author_id', options.authorId)
    if (options?.featured !== undefined) query = query.eq('featured', options.featured)
    if (options?.trending !== undefined) query = query.eq('trending', options.trending)
    if (options?.limit) query = query.limit(options.limit)
    if (options?.offset) query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    const { data, error } = await query
    if (error) {
      console.error('Error fetching posts:', error)
      return [] as Post[]
    }
    return data as Post[]
  },
  ['posts'],
  { revalidate: 60, tags: ['posts'] }
)

export async function getPosts(options?: {
  status?: string
  category?: string
  authorId?: string
  featured?: boolean
  trending?: boolean
  limit?: number
  offset?: number
}) {
  return _getPostsInner(JSON.stringify(options ?? {}))
}

export async function getPostBySlug(slug: string) {
  return unstable_cache(
    async () => {
      const supabase = createCachedClient()
      if (!supabase) {
        console.warn('⚠️  Supabase not configured. Check SETUP_GUIDE.md.')
        return null
      }
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:user_profiles!posts_author_id_fkey(*)
        `)
        .eq('slug', slug)
        .single()
      if (error) {
        console.error('Error fetching post:', error)
        return null
      }
      return data as Post
    },
    [`post-${slug}`],
    { revalidate: 60, tags: ['posts', `post-${slug}`] }
  )()
}

export async function getPostById(id: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:user_profiles!posts_author_id_fkey(*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching post:', error)
    return null
  }

  return data as Post
}

export async function createPost(post: Partial<Post>) {
  const supabase = await createClient()
  
  if (!supabase) {
    throw new Error('Supabase client not configured')
  }

  // Verify user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized: You must be logged in to create posts')
  }

  // Sanitize inputs
  const sanitizedPost = {
    ...post,
    title: post.title?.trim() || '',
    excerpt: post.excerpt?.trim() || '',
    content: post.content?.trim() || '',
  }

  if (!sanitizedPost.title || sanitizedPost.title.length < 3) {
    throw new Error('Title must be at least 3 characters')
  }

  // Rate limit check
  const rateLimitKey = `create-post:${user.id}`
  const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.CREATE_POST)
  if (!rateLimit.allowed) {
    throw new Error(`Too many posts created. Please try again in ${rateLimit.retryAfter} seconds.`)
  }

  // Build insert payload — include categories if the column exists in the DB.
  // Encode all selected categories: primary `category` + full list in `categories[]`.
  const selectedCategories: string[] =
    post.categories && post.categories.length > 0
      ? post.categories
      : post.category
      ? [post.category as string]
      : []

  const postToInsert = {
    ...post,
    categories: selectedCategories,
  }

  // Try inserting with `categories`; if the column is missing fall back without it.
  let { data, error } = await supabase
    .from('posts')
    .insert([postToInsert])
    .select()
    .single()

  if (error?.code === 'PGRST204' && error.message.includes("'categories'")) {
    // Column doesn't exist yet — strip it and retry
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { categories: _c, ...fallback } = postToInsert as any
    const retried = await supabase
      .from('posts')
      .insert([fallback])
      .select()
      .single()
    data = retried.data
    error = retried.error
  }

  if (error) {
    console.error('Error creating post:', error)
    throw error
  }

  revalidatePath('/admin/posts')
  revalidatePath('/')
  
  return data as Post
}

export async function updatePost(id: string, updates: Partial<Post>) {
  const supabase = await createClient()
  
  if (!supabase) {
    throw new Error('Supabase client not configured')
  }

  // Verify user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized: You must be logged in')
  }

  // Check if user is the author or an admin
  const { data: existingPost } = await supabase
    .from('posts')
    .select('author_id')
    .eq('id', id)
    .single()

  if (!existingPost) {
    throw new Error('Post not found')
  }

  // Get user role
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAuthor = existingPost.author_id === user.id
  const isAdmin = profile?.role === 'admin' || profile?.role === 'editor'

  if (!isAuthor && !isAdmin) {
    throw new Error('Unauthorized: You can only edit your own posts')
  }

  // Rate limit check
  const rateLimitKey = `update-post:${user.id}`
  const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.UPDATE_POST)
  if (!rateLimit.allowed) {
    throw new Error(`Too many updates. Please try again in ${rateLimit.retryAfter} seconds.`)
  }

  // Build a strict allowlist of writable DB columns — never pass joined
  // relations, computed fields, or enum values in the wrong case.
  const VALID_ENUM_CATEGORIES = new Set([
    'kubernetes','terraform','aws','azure','gcp','cicd',
    'security','observability','platform-engineering','docker','monitoring',
  ])
  const VALID_DIFFICULTIES = new Set(['beginner','intermediate','advanced','expert'])
  const VALID_STATUSES = new Set(['draft','pending','published','archived','rejected'])

  const rawCategory = String(updates.category ?? '').toLowerCase().trim()
  const rawDifficulty = String(updates.difficulty ?? '').toLowerCase().trim()
  const rawStatus = String(updates.status ?? '').toLowerCase().trim()

  if (updates.category !== undefined && !VALID_ENUM_CATEGORIES.has(rawCategory)) {
    throw new Error(`Invalid category value: "${updates.category}". Must be one of: ${[...VALID_ENUM_CATEGORIES].join(', ')}`)
  }
  if (updates.difficulty !== undefined && !VALID_DIFFICULTIES.has(rawDifficulty)) {
    throw new Error(`Invalid difficulty value: "${updates.difficulty}". Must be one of: ${[...VALID_DIFFICULTIES].join(', ')}`)
  }
  if (updates.status !== undefined && !VALID_STATUSES.has(rawStatus)) {
    throw new Error(`Invalid status value: "${updates.status}". Must be one of: ${[...VALID_STATUSES].join(', ')}`)
  }

  // Only include columns that exist and are writable in the posts table
  const payload: Record<string, unknown> = {}
  if (updates.title           !== undefined) payload.title           = updates.title
  if (updates.slug            !== undefined) payload.slug            = updates.slug
  if (updates.excerpt         !== undefined) payload.excerpt         = updates.excerpt
  if (updates.content         !== undefined) payload.content         = updates.content
  if (updates.cover_image_url !== undefined) payload.cover_image_url = updates.cover_image_url
  if (updates.category        !== undefined) payload.category        = rawCategory
  if (updates.categories      !== undefined) payload.categories      = updates.categories
  if (updates.tags            !== undefined) payload.tags            = updates.tags
  if (updates.difficulty      !== undefined) payload.difficulty      = rawDifficulty
  if (updates.status          !== undefined) payload.status          = rawStatus
  if (updates.featured        !== undefined) payload.featured        = updates.featured
  if (updates.trending        !== undefined) payload.trending        = updates.trending
  if (updates.word_count      !== undefined) payload.word_count      = updates.word_count
  if (updates.character_count !== undefined) payload.character_count = updates.character_count
  if (updates.estimated_read_time !== undefined) payload.estimated_read_time = updates.estimated_read_time
  if (updates.published_at    !== undefined) payload.published_at    = updates.published_at

  const { data, error } = await supabase
    .from('posts')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating post:', error)
    throw error
  }

  revalidatePath('/admin/posts')
  revalidatePath(`/blog/${data.slug}`)
  revalidatePath('/')

  return data as Post
}

export async function deletePost(id: string) {
  const supabase = await createClient()
  
  if (!supabase) {
    throw new Error('Supabase client not configured')
  }

  // Verify user is authenticated and authorized
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized: You must be logged in')
  }

  // Check if user is the author or an admin
  const { data: existingPost } = await supabase
    .from('posts')
    .select('author_id')
    .eq('id', id)
    .single()

  if (!existingPost) {
    throw new Error('Post not found')
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAuthor = existingPost.author_id === user.id
  const isAdmin = profile?.role === 'admin'

  if (!isAuthor && !isAdmin) {
    throw new Error('Unauthorized: You can only delete your own posts')
  }

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting post:', error)
    throw error
  }

  revalidatePath('/admin/posts')
  revalidatePath('/')
}

export async function approvePost(postId: string, adminId: string) {
  const supabase = await createClient()
  
  if (!supabase) {
    throw new Error('Supabase client not configured')
  }

  // Verify admin is authenticated and has admin role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== adminId) {
    throw new Error('Unauthorized: Authentication mismatch')
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', adminId)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'editor')) {
    throw new Error('Unauthorized: Admin privileges required')
  }

  const { data, error } = await supabase
    .from('posts')
    .update({
      status: 'published',
      approved_at: new Date().toISOString(),
      approved_by: adminId,
      published_at: new Date().toISOString(),
    })
    .eq('id', postId)
    .select()
    .single()

  if (error) {
    console.error('Error approving post:', error)
    throw error
  }

  revalidatePath('/admin/posts')
  revalidatePath('/')
  
  return data as Post
}

export async function rejectPost(postId: string, adminId: string, reason: string) {
  const supabase = await createClient()
  
  if (!supabase) {
    throw new Error('Supabase client not configured')
  }

  // Verify admin is authenticated and has admin role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== adminId) {
    throw new Error('Unauthorized: Authentication mismatch')
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', adminId)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'editor')) {
    throw new Error('Unauthorized: Admin privileges required')
  }

  if (!reason || reason.trim().length < 10) {
    throw new Error('Rejection reason must be at least 10 characters')
  }

  const { data, error } = await supabase
    .from('posts')
    .update({
      status: 'rejected',
      rejected_at: new Date().toISOString(),
      rejected_by: adminId,
      rejection_reason: reason,
    })
    .eq('id', postId)
    .select()
    .single()

  if (error) {
    console.error('Error rejecting post:', error)
    throw error
  }

  revalidatePath('/admin/posts')
  
  return data as Post
}

export async function incrementPostView(postId: string) {
  const supabase = await createClient()
  
  if (!supabase) return
  
  const { error } = await supabase.rpc('increment_post_view', {
    post_id: postId
  })

  if (error) {
    console.error('Error incrementing view count:', error)
  }
}

export async function togglePostLike(postId: string): Promise<{ liked: boolean; count: number }> {
  const supabase = await createClient()
  if (!supabase) return { liked: false, count: 0 }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Must be signed in to like posts')

  // Check if the user already liked this post
  const { data: existing } = await supabase
    .from('post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    // Unlike
    await supabase.from('post_likes').delete().eq('id', existing.id)
    await supabase.rpc('decrement_post_like', { post_id: postId }).catch(() => {})
    const { data: post } = await supabase.from('posts').select('like_count').eq('id', postId).single()
    return { liked: false, count: post?.like_count ?? 0 }
  } else {
    // Like
    await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id })
    await supabase.rpc('increment_post_like', { post_id: postId }).catch(() => {})
    const { data: post } = await supabase.from('posts').select('like_count').eq('id', postId).single()
    return { liked: true, count: post?.like_count ?? 0 }
  }
}

export async function togglePostBookmark(postId: string): Promise<{ bookmarked: boolean }> {
  const supabase = await createClient()
  if (!supabase) return { bookmarked: false }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Must be signed in to bookmark posts')

  const { data: existing } = await supabase
    .from('post_bookmarks')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    await supabase.from('post_bookmarks').delete().eq('id', existing.id)
    await supabase.rpc('decrement_post_bookmark', { post_id: postId }).catch(() => {})
    return { bookmarked: false }
  } else {
    await supabase.from('post_bookmarks').insert({ post_id: postId, user_id: user.id })
    await supabase.rpc('increment_post_bookmark', { post_id: postId }).catch(() => {})
    return { bookmarked: true }
  }
}

export async function getPostInteractions(postId: string): Promise<{ liked: boolean; bookmarked: boolean; likeCount: number }> {
  const supabase = await createClient()
  if (!supabase) return { liked: false, bookmarked: false, likeCount: 0 }

  const { data: { user } } = await supabase.auth.getUser()

  const { data: post } = await supabase.from('posts').select('like_count').eq('id', postId).single()

  if (!user) return { liked: false, bookmarked: false, likeCount: post?.like_count ?? 0 }

  const [{ data: likeRow }, { data: bookmarkRow }] = await Promise.all([
    supabase.from('post_likes').select('id').eq('post_id', postId).eq('user_id', user.id).maybeSingle(),
    supabase.from('post_bookmarks').select('id').eq('post_id', postId).eq('user_id', user.id).maybeSingle(),
  ])

  return {
    liked: !!likeRow,
    bookmarked: !!bookmarkRow,
    likeCount: post?.like_count ?? 0,
  }
}

export async function searchPosts(query: string, limit = 5) {
  const supabase = await createClient()

  // Sanitize and validate query
  const sanitizedQuery = query.trim().replace(/[<>"';\\]/g, '')
  
  if (!sanitizedQuery) {
    return []
  }

  if (sanitizedQuery.length > 100) {
    throw new Error('Search query is too long')
  }

  if (limit > 50) {
    limit = 50 // Cap the limit
  }

  if (!supabase) {
    return []
  }

  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:user_profiles!posts_author_id_fkey(*)
      `)
      .eq('status', 'published')
      .or(`title.ilike.%${sanitizedQuery}%,excerpt.ilike.%${sanitizedQuery}%,tags.cs.{${sanitizedQuery}}`)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return (data || []) as Post[]
  } catch (error) {
    console.error('Error searching posts:', error)
    return []
  }
}
