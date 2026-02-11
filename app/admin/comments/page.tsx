'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Search, ThumbsUp, Flag, Trash2, CheckCircle, XCircle, MessageSquare } from 'lucide-react'
import { getAllComments, updateCommentStatus, deleteComment } from '@/lib/actions/comments'
import type { Comment } from '@/lib/types/database'

interface AdminComment {
  id: string
  author_name: string
  author_email: string
  content: string
  post_title: string
  status: string
  like_count: number
  is_flagged: boolean
  flag_count: number
  created_at: string
}

export default function CommentsModeration() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [comments, setComments] = useState<AdminComment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadComments()
  }, [])

  const loadComments = async () => {
    try {
      const data = await getAllComments({ limit: 50 })
      const mapped: AdminComment[] = data.map((c: any) => ({
        id: c.id,
        author_name: c.author?.full_name || 'Unknown',
        author_email: c.author?.email || '',
        content: c.content,
        post_title: c.post?.title || 'Unknown Post',
        status: c.status,
        like_count: c.like_count || 0,
        is_flagged: c.is_flagged || false,
        flag_count: c.flag_count || 0,
        created_at: c.created_at,
      }))
      setComments(mapped)
    } catch (error) {
      console.error('Failed to load comments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (commentId: string) => {
    try {
      await updateCommentStatus(commentId, 'approved')
      await loadComments()
    } catch (error) {
      console.error('Failed to approve comment:', error)
    }
  }

  const handleReject = async (commentId: string) => {
    try {
      await updateCommentStatus(commentId, 'rejected')
      await loadComments()
    } catch (error) {
      console.error('Failed to reject comment:', error)
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('Delete this comment permanently?')) return
    try {
      await deleteComment(commentId)
      await loadComments()
    } catch (error) {
      console.error('Failed to delete comment:', error)
    }
  }

  const filteredComments = comments.filter(comment => {
    const matchesSearch = comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         comment.author_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         comment.post_title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'flagged' && comment.is_flagged) ||
                         (statusFilter !== 'flagged' && comment.status === statusFilter)
    return matchesSearch && matchesStatus
  })

  const totalCount = comments.length
  const pendingCount = comments.filter(c => c.status === 'pending').length
  const flaggedCount = comments.filter(c => c.is_flagged).length
  const approvedTodayCount = comments.filter(c => {
    const created = new Date(c.created_at)
    const today = new Date()
    return c.status === 'approved' && created.toDateString() === today.toDateString()
  }).length

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Comment Moderation</h1>
            <p className="text-gray-400">Review and moderate user comments</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Comments', value: totalCount.toLocaleString(), color: 'electric-cyan' },
            { label: 'Pending Review', value: pendingCount.toString(), color: 'yellow-400' },
            { label: 'Flagged', value: flaggedCount.toString(), color: 'red-400' },
            { label: 'Approved Today', value: approvedTodayCount.toString(), color: 'cyber-lime' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search comments, authors, or posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-electric-cyan/50"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'pending', 'approved', 'flagged'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-3 rounded-xl font-semibold capitalize transition-all ${
                  statusFilter === status
                    ? 'bg-electric-cyan/20 text-electric-cyan'
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-electric-cyan/30 border-t-electric-cyan rounded-full animate-spin" />
            </div>
          ) : filteredComments.length === 0 ? (
            <div className="text-center py-12 rounded-2xl bg-white/5 border border-white/10">
              <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No comments found</p>
            </div>
          ) : (
            filteredComments.map((comment) => (
              <div
                key={comment.id}
                className={`rounded-2xl bg-white/5 border p-6 transition-all ${
                  comment.is_flagged 
                    ? 'border-red-500/50 bg-red-500/5' 
                    : 'border-white/10 hover:bg-white/[0.07]'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-cyber flex-shrink-0 flex items-center justify-center text-white font-bold">
                    {comment.author_name.charAt(0).toUpperCase()}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Author & Meta */}
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white">{comment.author_name}</h3>
                          {comment.is_flagged && (
                            <span className="px-2 py-1 rounded-md bg-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-1">
                              <Flag className="w-3 h-3" />
                              Flagged ({comment.flag_count})
                            </span>
                          )}
                          {comment.status === 'approved' && (
                            <CheckCircle className="w-4 h-4 text-cyber-lime" />
                          )}
                        </div>
                        <p className="text-sm text-gray-400">{comment.author_email}</p>
                      </div>
                      <span className="text-sm text-gray-400">{new Date(comment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {/* Post Reference */}
                    <div className="mb-3 flex items-center gap-2 text-sm text-gray-400">
                      <MessageSquare className="w-4 h-4" />
                      <span>On: <span className="text-electric-cyan">{comment.post_title}</span></span>
                    </div>

                    {/* Comment Text */}
                    <p className="text-gray-300 mb-4 leading-relaxed">{comment.content}</p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-gray-400">
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-sm">{comment.like_count}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {comment.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleApprove(comment.id)}
                              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyber-lime/20 text-cyber-lime hover:bg-cyber-lime/30 transition-colors font-semibold text-sm"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Approve
                            </button>
                            <button 
                              onClick={() => handleReject(comment.id)}
                              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors font-semibold text-sm"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </button>
                          </>
                        )}
                        <button className="px-4 py-2 rounded-lg bg-yellow-400/20 text-yellow-400 hover:bg-yellow-400/30 transition-colors">
                          <Flag className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(comment.id)}
                          className="px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/20 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-6">
          <p className="text-sm text-gray-400">Showing {filteredComments.length} of {totalCount} comments</p>
        </div>
      </div>
    </AdminLayout>
  )
}
