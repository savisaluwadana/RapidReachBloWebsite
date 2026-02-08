'use server'

import { createClient } from '@/lib/supabase/server'
import { Comment } from '@/lib/types/database'
import { revalidatePath } from 'next/cache'

export async function getCommentsByPostId(postId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      author:user_profiles(*),
      post:posts(id, title, slug)
    `)
    .eq('post_id', postId)
    .eq('status', 'approved')
    .is('parent_comment_id', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching comments:', error)
    return []
  }

  // Fetch replies for each comment
  const commentsWithReplies = await Promise.all(
    (data || []).map(async (comment: any) => {
      const { data: replies } = await supabase
        .from('comments')
        .select(`
          *,
          author:user_profiles(*)
        `)
        .eq('parent_comment_id', comment.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: true })

      return {
        ...comment,
        replies: replies || []
      }
    })
  )

  return commentsWithReplies as Comment[]
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
      author:user_profiles(*),
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

export async function createComment(comment: {
  post_id: string
  author_id: string
  content: string
  parent_comment_id?: string
}) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('comments')
    .insert([{
      ...comment,
      status: 'approved', // Auto-approve for now, can change to 'pending' for moderation
    }])
    .select(`
      *,
      author:user_profiles(*)
    `)
    .single()

  if (error) {
    console.error('Error creating comment:', error)
    throw error
  }

  revalidatePath(`/blog/*`)
  revalidatePath('/admin/comments')
  
  return data as Comment
}

export async function updateCommentStatus(commentId: string, status: string, moderatorId?: string) {
  const supabase = await createClient()
  
  const updates: any = { status }
  
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
    throw error
  }

  revalidatePath('/admin/comments')
  revalidatePath(`/blog/*`)
  
  return data as Comment
}

export async function deleteComment(commentId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)

  if (error) {
    console.error('Error deleting comment:', error)
    throw error
  }

  revalidatePath('/admin/comments')
  revalidatePath(`/blog/*`)
}

export async function flagComment(commentId: string, reason: string) {
  const supabase = await createClient()
  
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
    throw error
  }

  return data as Comment
}
