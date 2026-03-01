'use server'

import { createClient } from '@/lib/supabase/server'
import { Comment } from '@/lib/types/database'
import { revalidatePath } from 'next/cache'
import { checkRateLimit, RATE_LIMITS } from '@/lib/utils/rate-limit'

export async function getCommentsByPostId(postId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      author:user_profiles!comments_author_id_fkey(id, full_name, avatar_url)
    `)
    .eq('post_id', postId)
    .eq('status', 'approved')
    .is('parent_comment_id', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching comments:', error)
    return []
  }

  // Helper to normalize author shape for the component
  const normalizeAuthor = (raw: any) => {
    const a = Array.isArray(raw) ? raw[0] : raw
    return {
      id: a?.id || '',
      name: a?.full_name || a?.name || 'Anonymous',
      avatar_url: a?.avatar_url || null,
    }
  }

  // Fetch replies for each comment
  const commentsWithReplies = await Promise.all(
    (data || []).filter(Boolean).map(async (comment: any) => {
      const { data: replies } = await supabase
        .from('comments')
        .select(`
          *,
          author:user_profiles!comments_author_id_fkey(id, full_name, avatar_url)
        `)
        .eq('parent_comment_id', comment.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: true })

      return {
        id: comment.id,
        post_id: comment.post_id,
        author_id: comment.author_id,
        content: comment.content,
        status: comment.status,
        is_flagged: comment.is_flagged,
        flag_count: comment.flag_count,
        like_count: comment.like_count ?? 0,
        reply_count: comment.reply_count ?? 0,
        is_spam: comment.is_spam,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        parent_comment_id: comment.parent_comment_id,
        author: normalizeAuthor(comment.author),
        replies: (replies || []).filter(Boolean).map((r: any) => ({
          id: r.id,
          post_id: r.post_id,
          author_id: r.author_id,
          content: r.content,
          status: r.status,
          is_flagged: r.is_flagged,
          flag_count: r.flag_count,
          like_count: r.like_count ?? 0,
          reply_count: r.reply_count ?? 0,
          is_spam: r.is_spam,
          created_at: r.created_at,
          updated_at: r.updated_at,
          parent_comment_id: r.parent_comment_id,
          author: normalizeAuthor(r.author),
          replies: [],
        })),
      }
    })
  )

  return commentsWithReplies
}

export async function getAllComments(options?: {
  status?: string
  limit?: number
  offset?: number
}) {
  const supabase = await createClient()
  
  let query = supabase
    .from('comments')
    .select(`
      *,
      author:user_profiles!comments_author_id_fkey(*),
      post:posts(id, title, slug)
    `)
    .order('created_at', { ascending: false })

  if (options?.status) {
    query = query.eq('status', options.status)
  }
  if (options?.limit) {
    query = query.limit(options.limit)
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching comments:', error)
    return []
  }

  return data as Comment[]
}

export async function getCommentById(id: string) {
  const supabase = await createClient()
  if (!supabase) return null

  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        author:user_profiles!comments_author_id_fkey(id, full_name, avatar_url),
        post:posts(id, slug)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Comment
  } catch (error) {
    console.error('Error fetching comment by id:', error)
    return null
  }
}

export async function updateComment(commentId: string, updates: Partial<{ content: string }>) {
  const supabase = await createClient()
  if (!supabase) {
    throw new Error('Supabase client not configured')
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized: You must be logged in')

  // Fetch existing comment
  const { data: existing } = await supabase
    .from('comments')
    .select('author_id, post_id')
    .eq('id', commentId)
    .single()

  if (!existing) throw new Error('Comment not found')

  // Check permissions: author can edit their own comment; admins/editors can edit any
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAuthor = existing.author_id === user.id
  const isAdmin = profile?.role === 'admin' || profile?.role === 'editor'
  if (!isAuthor && !isAdmin) throw new Error('Unauthorized: You can only edit your own comments')

  // Validate updates
  const payload: any = {}
  if (updates.content !== undefined) {
    const c = String(updates.content).trim()
    if (!c || c.length < 1) throw new Error('Comment cannot be empty')
    if (c.length > 5000) throw new Error('Comment is too long (max 5000 characters)')
    payload.content = c
    payload.updated_at = new Date().toISOString()
  }

  if (Object.keys(payload).length === 0) {
    throw new Error('No valid fields to update')
  }

  const { data, error } = await supabase
    .from('comments')
    .update(payload)
    .eq('id', commentId)
    .select()
    .single()

  if (error) {
    console.error('Error updating comment:', error)
    throw new Error(error.message ?? `Database error (${error.code})`)
  }

  // Revalidate related pages
  try {
    revalidatePath('/admin/comments')
    // If we have the post id, revalidate the post page; otherwise revalidate blog listing
    if (existing.post_id) revalidatePath(`/blog/${existing.post_id}`)
    revalidatePath('/blog/*')
  } catch (e) {
    console.warn('Failed to revalidate after comment update:', e)
  }

  return data as Comment
}

export async function createComment(comment: {
  post_id: string
  author_id: string
  content: string
  parent_comment_id?: string
}) {
  const supabase = await createClient()
  
  if (!supabase) {
    throw new Error('Supabase client not configured')
  }

  // Verify user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== comment.author_id) {
    throw new Error('Unauthorized: Authentication mismatch')
  }

  // Validate and sanitize content
  const sanitizedContent = comment.content.trim()
  if (!sanitizedContent || sanitizedContent.length < 1) {
    throw new Error('Comment cannot be empty')
  }
  if (sanitizedContent.length > 5000) {
    throw new Error('Comment is too long (max 5000 characters)')
  }

  // Check for spam patterns (simple check)
  const urlCount = (sanitizedContent.match(/https?:\/\//g) || []).length
  if (urlCount > 3) {
    throw new Error('Too many links in comment')
  }

  // Rate limit check
  const rateLimitKey = `create-comment:${user.id}`
  const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.CREATE_COMMENT)
  if (!rateLimit.allowed) {
    throw new Error(`Too many comments. Please try again in ${rateLimit.retryAfter} seconds.`)
  }

  const { data, error } = await supabase
    .from('comments')
    .insert([{
      ...comment,
      content: sanitizedContent,
      status: 'approved', // Auto-approve for now, can change to 'pending' for moderation
    }])
    .select(`
      *,
      author:user_profiles!comments_author_id_fkey(*)
    `)
    .single()

  if (error) {
    console.error('Error creating comment:', error)
    throw new Error(error.message ?? `Database error (${error.code})`)
  }

  revalidatePath(`/blog/*`)
  revalidatePath('/admin/comments')
  
  return data as Comment
}

export async function updateCommentStatus(commentId: string, status: string, moderatorId?: string) {
  const supabase = await createClient()
  
  if (!supabase) {
    throw new Error('Supabase client not configured')
  }

  // Verify moderator is authenticated and has appropriate role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized: You must be logged in')
  }

  if (moderatorId && user.id !== moderatorId) {
    throw new Error('Unauthorized: Authentication mismatch')
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'editor')) {
    throw new Error('Unauthorized: Moderator privileges required')
  }

  const VALID_COMMENT_STATUSES = new Set(['pending', 'approved', 'rejected', 'flagged'])
  const normalizedStatus = String(status).toLowerCase().trim()
  if (!VALID_COMMENT_STATUSES.has(normalizedStatus)) {
    throw new Error(`Invalid comment status: "${status}". Must be one of: ${[...VALID_COMMENT_STATUSES].join(', ')}`)
  }

  const updates: any = { status: normalizedStatus }
  
  if (moderatorId) {
    updates.moderated_at = new Date().toISOString()
    updates.moderated_by = moderatorId
  }
  
  const { data, error } = await supabase
    .from('comments')
    .update(updates)
    .eq('id', commentId)
    .select()
    .single()

  if (error) {
    console.error('Error updating comment:', error)
    throw new Error(error.message ?? `Database error (${error.code})`)
  }

  revalidatePath('/admin/comments')
  revalidatePath(`/blog/*`)
  
  return data as Comment
}

export async function deleteComment(commentId: string) {
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
  const { data: existingComment } = await supabase
    .from('comments')
    .select('author_id')
    .eq('id', commentId)
    .single()

  if (!existingComment) {
    throw new Error('Comment not found')
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAuthor = existingComment.author_id === user.id
  const isAdmin = profile?.role === 'admin' || profile?.role === 'editor'

  if (!isAuthor && !isAdmin) {
    throw new Error('Unauthorized: You can only delete your own comments')
  }

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)

  if (error) {
    console.error('Error deleting comment:', error)
    throw new Error(error.message ?? `Database error (${error.code})`)
  }

  revalidatePath('/admin/comments')
  revalidatePath(`/blog/*`)
}

export async function flagComment(commentId: string, reason: string) {
  const supabase = await createClient()
  
  if (!supabase) {
    throw new Error('Supabase client not configured')
  }

  // Verify user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized: You must be logged in to flag comments')
  }

  // Validate reason
  const sanitizedReason = reason.trim()
  if (!sanitizedReason || sanitizedReason.length < 5) {
    throw new Error('Flag reason must be at least 5 characters')
  }

  const { data: comment } = await supabase
    .from('comments')
    .select('flag_count, flag_reasons')
    .eq('id', commentId)
    .single()

  const flagReasons = comment?.flag_reasons || []
  flagReasons.push(reason)
  
  const { data, error } = await supabase
    .from('comments')
    .update({
      is_flagged: true,
      flag_count: (comment?.flag_count || 0) + 1,
      flag_reasons: flagReasons,
    })
    .eq('id', commentId)
    .select()
    .single()

  if (error) {
    console.error('Error flagging comment:', error)
    throw new Error(error.message ?? `Database error (${error.code})`)
  }

  return data as Comment
}
