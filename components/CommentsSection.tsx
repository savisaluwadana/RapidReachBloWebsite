'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, ThumbsUp, Reply, Flag, MoreVertical } from 'lucide-react'
import { getCommentsByPostId, createComment } from '@/lib/actions/comments'
import { getCurrentUser } from '@/lib/actions/auth'
import type { Comment as DBComment } from '@/lib/types/database'

interface Comment {
  id: string
  author: {
    id: string
    name: string
    avatar_url?: string
  }
  content: string
  created_at: string
  like_count: number
  replies?: Comment[]
}

function formatTimeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`
  const years = Math.floor(months / 12)
  return `${years} year${years > 1 ? 's' : ''} ago`
}

function CommentItem({ comment, depth = 0, onReply }: { comment: Comment; depth?: number; onReply: (parentId: string, content: string) => void }) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likes, setLikes] = useState(comment.like_count)
  const [replyContent, setReplyContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLike = async () => {
    setIsLiked(!isLiked)
    setLikes(prev => isLiked ? prev - 1 : prev + 1)
  }

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) return
    
    setIsSubmitting(true)
    try {
      await onReply(comment.id, replyContent)
      setReplyContent('')
      setShowReplyForm(false)
    } catch (error) {
      console.error('Failed to submit reply:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={`${depth > 0 ? 'ml-10 mt-3' : ''}`}>
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-white/[0.06] flex-shrink-0 flex items-center justify-center text-xs text-gray-400 font-medium">
          {comment.author.name.charAt(0).toUpperCase()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-medium text-gray-200">{comment.author.name}</h4>
            <span className="text-[10px] text-gray-600">{formatTimeAgo(comment.created_at)}</span>
          </div>
          
          <p className="text-sm text-gray-400 mb-2.5 leading-relaxed">{comment.content}</p>

          {/* Actions */}
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 text-xs transition-colors ${
                isLiked ? 'text-electric-cyan' : 'text-gray-600 hover:text-electric-cyan'
              }`}
            >
              <ThumbsUp className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
              {likes}
            </button>
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-300 transition-colors"
            >
              <Reply className="w-3 h-3" />
              Reply
            </button>
            <button className="flex items-center gap-1 text-xs text-gray-600 hover:text-yellow-500 transition-colors">
              <Flag className="w-3 h-3" />
              Report
            </button>
          </div>

          {/* Reply Form */}
          {showReplyForm && (
            <div className="mb-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="w-full p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04] text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-electric-cyan/30 resize-none"
                rows={3}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => setShowReplyForm(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:text-white transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleReplySubmit}
                  disabled={isSubmitting || !replyContent.trim()}
                  className="px-4 py-1.5 rounded-lg bg-electric-cyan text-xs font-medium text-white transition-colors hover:bg-electric-cyan/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Posting...' : 'Reply'}
                </button>
              </div>
            </div>
          )}

          {/* Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="space-y-3">
              {comment.replies.map(reply => (
                <CommentItem key={reply.id} comment={reply} depth={depth + 1} onReply={onReply} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CommentsSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadComments()
  }, [postId])

  const loadComments = async () => {
    try {
      const data = await getCommentsByPostId(postId)
      // Transform the data to match our interface
      const transformedComments: Comment[] = data.map((comment: any) => ({
        ...comment,
        author: {
          id: comment.author?.id || '',
          name: comment.author?.full_name || 'Anonymous',
          avatar_url: comment.author?.avatar_url
        }
      }))
      setComments(transformedComments)
    } catch (error) {
      console.error('Failed to load comments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      const user = await getCurrentUser()
      if (!user) {
        alert('Please sign in to comment')
        return
      }

      await createComment({
        post_id: postId,
        author_id: user.id,
        content: newComment,
      })
      
      setNewComment('')
      await loadComments()
    } catch (error) {
      console.error('Failed to post comment:', error)
      alert('Failed to post comment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReply = async (parentId: string, content: string) => {
    try {
      const user = await getCurrentUser()
      if (!user) {
        alert('Please sign in to reply')
        return
      }

      await createComment({
        post_id: postId,
        author_id: user.id,
        content,
        parent_comment_id: parentId,
      })
      
      await loadComments()
    } catch (error) {
      console.error('Failed to post reply:', error)
      throw error
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="w-5 h-5 border-2 border-electric-cyan/30 border-t-electric-cyan rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-gray-500" />
        <h2 className="text-sm font-medium text-gray-300">
          Comments <span className="text-gray-600">({comments.length})</span>
        </h2>
      </div>

      {/* New Comment Form */}
      <form onSubmit={handleSubmit} className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts..."
          className="w-full p-3 rounded-lg bg-white/[0.03] border border-white/[0.04] text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-electric-cyan/30 resize-none mb-3"
          rows={3}
          disabled={isSubmitting}
        />
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-gray-600">
            Please be respectful and constructive.
          </p>
          <button
            type="submit"
            disabled={!newComment.trim() || isSubmitting}
            className="px-4 py-2 rounded-lg bg-electric-cyan text-xs font-medium text-white transition-colors hover:bg-electric-cyan/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-10 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <MessageSquare className="w-8 h-8 text-gray-700 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No comments yet</p>
            <p className="text-[10px] text-gray-600 mt-1">Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4">
              <CommentItem comment={comment} onReply={handleReply} />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
