'use server'

import { createClient } from '@/lib/supabase/server'
import { Post, UserProfile } from '@/lib/types/database'
import { revalidatePath } from 'next/cache'
import { demoPosts } from '@/lib/demo-data'

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
    
    let filteredPosts = [...demoPosts]
    
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
      author:user_profiles(*)
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
  
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:user_profiles(*)
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
      author:user_profiles(*)
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
  
  const { error } = await supabase.rpc('increment_post_view', {
    post_id: postId
  })

  if (error) {
    console.error('Error incrementing view count:', error)
  }
}
