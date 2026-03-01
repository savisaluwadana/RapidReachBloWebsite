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
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Comment Moderation</h1>
          <p className="text-sm text-gray-500">Review and moderate user comments</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Comments', value: totalCount.toLocaleString(), icon: MessageSquare, color: 'text-electric-cyan' },
            { label: 'Pending Review', value: pendingCount.toString(), icon: MessageSquare, color: 'text-yellow-400' },
            { label: 'Flagged', value: flaggedCount.toString(), icon: Flag, color: 'text-red-400' },
            { label: 'Approved Today', value: approvedTodayCount.toString(), icon: CheckCircle, color: 'text-cyber-lime' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-[10px] text-gray-600 uppercase tracking-widest">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search comments, authors, or posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04] text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-electric-cyan/30"
            />
          </div>
          <div className="flex gap-1.5">
            {['all', 'pending', 'approved', 'flagged'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3.5 py-2.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                  statusFilter === status
                    ? 'bg-electric-cyan/10 text-electric-cyan border border-electric-cyan/20'
                    : 'bg-white/[0.02] text-gray-500 border border-white/[0.04] hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-5 h-5 border-2 border-electric-cyan/30 border-t-electric-cyan rounded-full animate-spin" />
            </div>
          ) : filteredComments.length === 0 ? (
            <div className="text-center py-16 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <MessageSquare className="w-10 h-10 text-gray-700 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-1">No comments found</p>
              <p className="text-xs text-gray-600">Try adjusting your search or filters.</p>
            </div>
          ) : (
            filteredComments.map((comment) => (
              <div
                key={comment.id}
                className={`rounded-xl border p-4 transition-colors ${
                  comment.is_flagged 
                    ? 'border-red-500/20 bg-red-500/[0.02]' 
                    : 'border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.03]'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.08] flex-shrink-0 flex items-center justify-center">
                    <span className="text-[10px] font-medium text-gray-300">{comment.author_name.charAt(0).toUpperCase()}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Author & Meta */}
                    <div className="flex items-start justify-between mb-1.5">
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <h3 className="text-sm font-medium text-white">{comment.author_name}</h3>
                          {comment.is_flagged && (
                            <span className="px-1.5 py-0.5 rounded-md bg-red-500/10 text-red-400 text-[10px] font-medium flex items-center gap-0.5">
                              <Flag className="w-2.5 h-2.5" />
                              Flagged ({comment.flag_count})
                            </span>
                          )}
                          {comment.status === 'approved' && (
                            <CheckCircle className="w-3.5 h-3.5 text-cyber-lime" />
                          )}
                        </div>
                        <p className="text-xs text-gray-600">{comment.author_email}</p>
                      </div>
                      <span className="text-xs text-gray-600">{new Date(comment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {/* Post Reference */}
                    <div className="mb-2 flex items-center gap-1.5 text-xs text-gray-500">
                      <MessageSquare className="w-3 h-3" />
                      <span>On: <span className="text-electric-cyan">{comment.post_title}</span></span>
                    </div>

                    {/* Comment Text */}
                    <p className="text-sm text-gray-400 mb-3 leading-relaxed">{comment.content}</p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span className="text-xs">{comment.like_count}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        {comment.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleApprove(comment.id)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-cyber-lime/10 text-cyber-lime hover:bg-cyber-lime/20 transition-colors text-xs font-medium"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Approve
                            </button>
                            <button 
                              onClick={() => handleReject(comment.id)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-xs font-medium"
                            >
                              <XCircle className="w-3 h-3" />
                              Reject
                            </button>
                          </>
                        )}
                        <button className="p-1.5 rounded-md hover:bg-yellow-400/10 text-gray-500 hover:text-yellow-400 transition-colors">
                          <Flag className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(comment.id)}
                          className="p-1.5 rounded-md hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-2">
          <p className="text-xs text-gray-600">Showing {filteredComments.length} of {totalCount} comments</p>
        </div>
      </div>
    </AdminLayout>
  )
}
