'use client'

import { useState } from 'react'
import { MessageSquare, ThumbsUp, Reply, Flag, MoreVertical } from 'lucide-react'

interface Comment {
  id: number
  author: string
  avatar?: string
  content: string
  timestamp: string
  likes: number
  replies?: Comment[]
}

const mockComments: Comment[] = [
  {
    id: 1,
    author: 'Sarah Chen',
    content: 'Great article! The section on resource limits was particularly helpful. I implemented this in our production cluster and saw immediate improvements.',
    timestamp: '2 hours ago',
    likes: 12,
    replies: [
      {
        id: 11,
        author: 'Alex Kumar',
        content: 'Totally agree! We had similar results. What resource quotas did you set?',
        timestamp: '1 hour ago',
        likes: 5,
      },
      {
        id: 12,
        author: 'Sarah Chen',
        content: 'We set memory limits at 2Gi for most services and CPU requests at 500m. Worked well for our workload!',
        timestamp: '45 minutes ago',
        likes: 8,
      },
    ],
  },
  {
    id: 2,
    author: 'Maria Rodriguez',
    content: 'Thanks for sharing this! Quick question: how do you handle these configurations in a multi-tenant environment?',
    timestamp: '3 hours ago',
    likes: 8,
  },
  {
    id: 3,
    author: 'John Doe',
    content: 'This is exactly what I needed. Bookmarked for future reference. 🔖',
    timestamp: '5 hours ago',
    likes: 15,
  },
]

function CommentItem({ comment, depth = 0 }: { comment: Comment; depth?: number }) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likes, setLikes] = useState(comment.likes)

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikes(prev => isLiked ? prev - 1 : prev + 1)
  }

  return (
    <div className={`${depth > 0 ? 'ml-12 mt-4' : ''}`}>
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-cyber flex-shrink-0" />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-white">{comment.author}</h4>
            <span className="text-sm text-gray-400">{comment.timestamp}</span>
          </div>
          
          <p className="text-gray-300 mb-3 leading-relaxed">{comment.content}</p>

          {/* Actions */}
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 text-sm font-semibold transition-colors ${
                isLiked ? 'text-electric-cyan' : 'text-gray-400 hover:text-electric-cyan'
              }`}
            >
              <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              {likes}
            </button>
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center gap-1 text-sm font-semibold text-gray-400 hover:text-white transition-colors"
            >
              <Reply className="w-4 h-4" />
              Reply
            </button>
            <button className="flex items-center gap-1 text-sm font-semibold text-gray-400 hover:text-yellow-400 transition-colors">
              <Flag className="w-4 h-4" />
              Report
            </button>
          </div>

          {/* Reply Form */}
          {showReplyForm && (
            <div className="mb-4 p-4 rounded-xl bg-white/5 border border-white/10">
              <textarea
                placeholder="Write a reply..."
                className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-electric-cyan/50 resize-none"
                rows={3}
              />
              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={() => setShowReplyForm(false)}
                  className="px-4 py-2 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button className="px-6 py-2 rounded-lg bg-gradient-cyber text-white font-semibold shadow-glow-md hover:shadow-glow-lg transition-all">
                  Reply
                </button>
              </div>
            </div>
          )}

          {/* Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="space-y-4">
              {comment.replies.map(reply => (
                <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CommentsSection({ postId = '1' }: { postId?: string }) {
  const [newComment, setNewComment] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle comment submission
    setNewComment('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <MessageSquare className="w-6 h-6 text-electric-cyan" />
        <h2 className="text-2xl font-bold text-white">
          Comments <span className="text-gray-400">({mockComments.length})</span>
        </h2>
      </div>

      {/* New Comment Form */}
      <form onSubmit={handleSubmit} className="rounded-2xl bg-white/5 border border-white/10 p-6">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts..."
          className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-electric-cyan/50 resize-none mb-4"
          rows={4}
        />
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Please be respectful and constructive in your comments.
          </p>
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="px-6 py-3 rounded-xl bg-gradient-cyber text-white font-semibold shadow-glow-md hover:shadow-glow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Post Comment
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        {mockComments.map(comment => (
          <div key={comment.id} className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <CommentItem comment={comment} />
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <button className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all font-semibold">
          Load More Comments
        </button>
      </div>
    </div>
  )
}
