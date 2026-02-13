'use server'

import { createClient } from '@/lib/supabase/server'
import { Post, UserProfile } from '@/lib/types/database'
import { revalidatePath } from 'next/cache'
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

export async function getSiteStats() {
  const supabase = await createClient()

  if (!supabase) {
    return { totalPosts: 0, totalUsers: 0, domainCounts: {} as Record<string, number> }
  }

  try {
    // Get total published posts
    const { count: totalPosts } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')

    // Get total users
    const { count: totalUsers } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })

    // Get all published posts' categories for domain counting
    const { data: posts } = await supabase
      .from('posts')
      .select('category')
      .eq('status', 'published')

    const domainCounts: Record<string, number> = {}
    for (const [domain, cats] of Object.entries(DOMAIN_CATEGORIES)) {
      domainCounts[domain] = (posts || []).filter(p =>
        cats.some(c => p.category?.toLowerCase().includes(c))
      ).length
    }

    return {
      totalPosts: totalPosts || 0,
      totalUsers: totalUsers || 0,
      domainCounts,
    }
  } catch (error) {
    console.error('Error fetching site stats:', error)
    return { totalPosts: 0, totalUsers: 0, domainCounts: {} as Record<string, number> }
  }
}

export async function getPosts(options?: {
  status?: string
  category?: string
  authorId?: string
  featured?: boolean
  trending?: boolean
  limit?: number
  offset?: number
}) {
  const supabase = await createClient()
  
  if (!supabase) {
    console.warn('⚠️  Supabase not configured. Check SETUP_GUIDE.md.')
    return []
  }
  
  let query = supabase
    .from('posts')
    .select(`
      *,
      author:user_profiles!posts_author_id_fkey(*)
    `)
    .order('created_at', { ascending: false })

  if (options?.status) {
    query = query.eq('status', options.status)
  }
  if (options?.category) {
    query = query.eq('category', options.category)
  }
  if (options?.authorId) {
    query = query.eq('author_id', options.authorId)
  }
  if (options?.featured !== undefined) {
    query = query.eq('featured', options.featured)
  }
  if (options?.trending !== undefined) {
    query = query.eq('trending', options.trending)
  }
  if (options?.limit) {
    query = query.limit(options.limit)
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching posts:', error)
    return []
  }

  return data as Post[]
}

export async function getPostBySlug(slug: string) {
  const supabase = await createClient()
  
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

  const { data, error } = await supabase
    .from('posts')
    .insert([post])
    .select()
    .single()

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

  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating post:', error)
    throw error
  }

  revalidatePath('/admin/posts')
  revalidatePath(`/blog/${data.slug}`)
  
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
