'use server'

import { createClient } from '@/lib/supabase/server'
import { Post, UserProfile } from '@/lib/types/database'
import { revalidatePath } from 'next/cache'
import { checkRateLimit, RATE_LIMITS } from '@/lib/utils/rate-limit'

// Demo data - inline to avoid "use server" restrictions
function getDemoPosts(): Post[] {
  const demoAuthor = {
    id: 'demo-author',
    email: 'demo@rapidreach.blog',
    full_name: 'Demo Author',
    username: 'demo',
    role: 'admin' as const,
    is_active: true,
    is_verified: true,
    email_notifications: true,
    comment_notifications: true,
    newsletter_subscribed: false,
    posts_written: 1,
    comments_posted: 0,
    total_views_received: 0,
    total_likes_received: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const basePost: Post = {
    id: 'demo-1',
    title: 'Getting Started with RapidReach',
    slug: 'getting-started',
    excerpt: 'Welcome to RapidReach! This is a demo post. Connect your Supabase database to see real content.',
    content: '# Welcome\n\nThis is demo content. Please configure your Supabase connection by following SETUP_GUIDE.md',
    author_id: 'demo-author',
    author: demoAuthor,
    category: 'platform-engineering',
    tags: ['demo', 'setup', 'getting-started'],
    difficulty: 'beginner' as const,
    status: 'published' as const,
    featured: true,
    trending: false,
    view_count: 0,
    unique_view_count: 0,
    like_count: 0,
    comment_count: 0,
    share_count: 0,
    bookmark_count: 0,
    estimated_read_time: 5,
    word_count: 100,
    character_count: 500,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  return [
    basePost,
    {
      ...basePost,
      id: 'demo-2',
      title: 'Kubernetes Resource Management Best Practices',
      slug: 'kubernetes-resource-management',
      excerpt: 'Learn how to properly configure resource limits, requests, and quotas for production Kubernetes clusters.',
      category: 'kubernetes',
      tags: ['kubernetes', 'resources', 'production'],
      featured: false,
      trending: true,
    },
    {
      ...basePost,
      id: 'demo-3',
      title: 'Terraform State Management in Production',
      slug: 'terraform-state-management',
      excerpt: 'Best practices for managing Terraform state files securely in team environments with remote backends.',
      category: 'terraform',
      tags: ['terraform', 'infrastructure', 'state'],
      featured: false,
      trending: false,
    },
    {
      ...basePost,
      id: 'demo-4',
      title: 'Building CI/CD Pipelines with GitHub Actions',
      slug: 'cicd-github-actions',
      excerpt: 'A comprehensive guide to setting up continuous integration and deployment pipelines using GitHub Actions.',
      category: 'cicd',
      tags: ['ci-cd', 'github-actions', 'automation'],
      featured: false,
      trending: true,
    },
    {
      ...basePost,
      id: 'demo-5',
      title: 'Cloud Security Best Practices for DevOps Teams',
      slug: 'cloud-security-devops',
      excerpt: 'Essential security practices every DevOps team should implement to protect cloud-native applications.',
      category: 'security',
      tags: ['security', 'cloud', 'devops'],
      featured: false,
      trending: false,
    },
    {
      ...basePost,
      id: 'demo-6',
      title: 'GitOps with ArgoCD: A Complete Guide',
      slug: 'gitops-argocd-guide',
      excerpt: 'Implement GitOps workflows using ArgoCD for automated, declarative Kubernetes deployments.',
      category: 'kubernetes',
      tags: ['gitops', 'argocd', 'kubernetes'],
      featured: false,
      trending: true,
    },
  ]
}

// =====================================================
// POST ACTIONS
// =====================================================

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
  
  // Return demo data if Supabase is not configured
  if (!supabase) {
    console.warn('⚠️  Supabase not configured. Returning demo posts.')
    console.warn('📖 Check SETUP_GUIDE.md for configuration instructions.')
    
    let filteredPosts = getDemoPosts()
    
    if (options?.category) {
      filteredPosts = filteredPosts.filter(p => p.category.toLowerCase() === options.category!.toLowerCase())
    }
    if (options?.featured !== undefined) {
      filteredPosts = filteredPosts.filter(p => p.featured === options.featured)
    }
    if (options?.trending !== undefined) {
      filteredPosts = filteredPosts.filter(p => p.trending === options.trending)
    }
    if (options?.limit) {
      filteredPosts = filteredPosts.slice(0, options.limit)
    }
    
    return filteredPosts
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
  
  // Demo mode fallback
  if (!supabase) {
    const demoPost = getDemoPosts().find(p => p.slug === slug)
    if (demoPost) {
      return {
        ...demoPost,
        content: `# ${demoPost.title}\n\n${demoPost.excerpt}\n\n## Getting Started\n\nThis is a demo article. Connect your Supabase database to see real content with full formatting.\n\n### What You'll Learn\n\n- How to set up your development environment\n- Best practices for production deployments\n- Advanced configuration techniques\n- Monitoring and observability\n\n### Prerequisites\n\nBefore diving in, make sure you have:\n\n1. A working knowledge of DevOps fundamentals\n2. Access to a cloud provider (AWS, GCP, or Azure)\n3. Basic command-line experience\n\n> 💡 **Tip:** Follow the SETUP_GUIDE.md to connect your Supabase database and unlock all features including comments, likes, and bookmarks.\n\n---\n\n*This demo content will be replaced with your real articles once Supabase is configured.*`,
      } as Post
    }
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
  
  if (!supabase) return // Demo mode - no-op
  
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
    const q = sanitizedQuery.toLowerCase()
    return getDemoPosts()
      .filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.excerpt.toLowerCase().includes(q) ||
        p.tags?.some(tag => tag.toLowerCase().includes(q))
      )
      .slice(0, limit)
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
    // Fallback to demo data on error
    const q = sanitizedQuery.toLowerCase()
    return getDemoPosts()
      .filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.excerpt.toLowerCase().includes(q)
      )
      .slice(0, limit)
  }
}
