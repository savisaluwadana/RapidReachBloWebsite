'use client'

import { useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Search, ThumbsUp, Flag, Trash2, CheckCircle, XCircle, MessageSquare } from 'lucide-react'

const mockComments = [
  {
    id: 1,
    author: 'Sarah Chen',
    email: 'sarah.chen@example.com',
    content: 'Great article on Kubernetes best practices! The section about resource limits was particularly helpful.',
    post: 'Kubernetes Resource Management Best Practices',
    status: 'approved',
    likes: 12,
    flagged: false,
    date: '2 hours ago',
    avatar: '/avatars/sarah.png',
  },
  {
    id: 2,
    author: 'Anonymous User',
    email: 'spam@fake.com',
    content: 'Click here for free hosting!!! www.scam-site.com',
    post: 'CI/CD Pipeline Optimization',
    status: 'pending',
    likes: 0,
    flagged: true,
    date: '30 minutes ago',
    avatar: null,
  },
  {
    id: 3,
    author: 'Alex Kumar',
    email: 'alex.kumar@example.com',
    content: 'I disagree with the approach suggested here. There are better ways to handle this in production environments.',
    post: 'Terraform State Management',
    status: 'pending',
    likes: 5,
    flagged: true,
    date: '1 hour ago',
    avatar: '/avatars/alex.png',
  },
  {
    id: 4,
    author: 'Maria Rodriguez',
    email: 'maria.r@example.com',
    content: 'Thanks for this! I implemented this in our platform and it reduced our deployment time by 40%.',
    post: 'GitOps with ArgoCD',
    status: 'approved',
    likes: 18,
    flagged: false,
    date: '5 hours ago',
    avatar: '/avatars/maria.png',
  },
]

export default function CommentsModeration() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredComments = mockComments.filter(comment => {
    const matchesSearch = comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         comment.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         comment.post.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'flagged' && comment.flagged) ||
                         (statusFilter !== 'flagged' && comment.status === statusFilter)
    return matchesSearch && matchesStatus
  })

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
            { label: 'Total Comments', value: '3,842', change: '+23%', color: 'electric-cyan' },
            { label: 'Pending Review', value: '15', change: '-5%', color: 'yellow-400' },
            { label: 'Flagged', value: '8', change: '+2', color: 'red-400' },
            { label: 'Approved Today', value: '47', change: '+18%', color: 'cyber-lime' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-sm text-gray-400 mb-2">{stat.label}</p>
              <p className={`text-xs font-semibold text-${stat.color}`}>{stat.change}</p>
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
          {filteredComments.map((comment) => (
            <div
              key={comment.id}
              className={`rounded-2xl bg-white/5 border p-6 transition-all ${
                comment.flagged 
                  ? 'border-red-500/50 bg-red-500/5' 
                  : 'border-white/10 hover:bg-white/[0.07]'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-cyber flex-shrink-0" />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Author & Meta */}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white">{comment.author}</h3>
                        {comment.flagged && (
                          <span className="px-2 py-1 rounded-md bg-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-1">
                            <Flag className="w-3 h-3" />
                            Flagged
                          </span>
                        )}
                        {comment.status === 'approved' && (
                          <CheckCircle className="w-4 h-4 text-cyber-lime" />
                        )}
                      </div>
                      <p className="text-sm text-gray-400">{comment.email}</p>
                    </div>
                    <span className="text-sm text-gray-400">{comment.date}</span>
                  </div>

                  {/* Post Reference */}
                  <div className="mb-3 flex items-center gap-2 text-sm text-gray-400">
                    <MessageSquare className="w-4 h-4" />
                    <span>On: <span className="text-electric-cyan">{comment.post}</span></span>
                  </div>

                  {/* Comment Text */}
                  <p className="text-gray-300 mb-4 leading-relaxed">{comment.content}</p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-gray-400">
                        <ThumbsUp className="w-4 h-4" />
                        <span className="text-sm">{comment.likes}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {comment.status === 'pending' && (
                        <>
                          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyber-lime/20 text-cyber-lime hover:bg-cyber-lime/30 transition-colors font-semibold text-sm">
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </button>
                          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors font-semibold text-sm">
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </>
                      )}
                      <button className="px-4 py-2 rounded-lg bg-yellow-400/20 text-yellow-400 hover:bg-yellow-400/30 transition-colors">
                        <Flag className="w-4 h-4" />
                      </button>
                      <button className="px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/20 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-6">
          <p className="text-sm text-gray-400">Showing {filteredComments.length} of {mockComments.length} comments</p>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
              Previous
            </button>
            <button className="px-4 py-2 rounded-lg bg-electric-cyan/20 text-electric-cyan font-semibold">
              1
            </button>
            <button className="px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
              2
            </button>
            <button className="px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
              Next
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
