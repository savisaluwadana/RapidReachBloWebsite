'use client'

import { useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Plus, Search, Filter, Eye, Edit, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

const mockPosts = [
  {
    id: 1,
    title: 'Building Production-Ready Kubernetes Clusters',
    author: 'Sarah Chen',
    status: 'published',
    category: 'Kubernetes',
    views: 12453,
    comments: 34,
    date: 'Feb 8, 2026',
    readTime: '12 min',
  },
  {
    id: 2,
    title: 'Terraform State Management Best Practices',
    author: 'Alex Kumar',
    status: 'pending',
    category: 'Terraform',
    views: 0,
    comments: 0,
    date: 'Feb 8, 2026',
    readTime: '8 min',
  },
  {
    id: 3,
    title: 'Zero-Trust Security in Cloud Native Applications',
    author: 'Maria Rodriguez',
    status: 'draft',
    category: 'Security',
    views: 0,
    comments: 0,
    date: 'Feb 7, 2026',
    readTime: '10 min',
  },
  {
    id: 4,
    title: 'Platform Engineering Guide 2026',
    author: 'Admin',
    status: 'published',
    category: 'Platform Engineering',
    views: 8923,
    comments: 28,
    date: 'Feb 6, 2026',
    readTime: '15 min',
  },
]

export default function PostsManagement() {
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPosts = mockPosts.filter(post => {
    const matchesFilter = filter === 'all' || post.status === filter
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.author.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const statusColors = {
    published: 'bg-cyber-lime/20 text-cyber-lime',
    pending: 'bg-yellow-400/20 text-yellow-400',
    draft: 'bg-gray-500/20 text-gray-400',
  }

  const statusIcons = {
    published: CheckCircle,
    pending: Clock,
    draft: Edit,
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Posts Management</h1>
            <p className="text-gray-400">Manage all blog posts and approvals</p>
          </div>
          <Link href="/admin/posts/new">
            <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-cyber text-white font-semibold shadow-glow-md hover:shadow-glow-lg transition-all">
              <Plus className="w-5 h-5" />
              New Post
            </button>
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts by title or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-electric-cyan/50"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            {['all', 'published', 'pending', 'draft'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-3 rounded-xl font-semibold capitalize transition-all ${
                  filter === status
                    ? 'bg-electric-cyan/20 text-electric-cyan'
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Posts Table */}
        <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Post
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredPosts.map((post) => {
                  const StatusIcon = statusIcons[post.status as keyof typeof statusIcons]
                  return (
                    <tr key={post.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <h3 className="font-semibold text-white mb-1">{post.title}</h3>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-electric-cyan/10 text-electric-cyan text-xs font-semibold">
                              {post.category}
                            </span>
                            <span className="text-gray-500 text-xs">{post.readTime}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-cyber" />
                          <span className="text-gray-300 text-sm">{post.author}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${statusColors[post.status as keyof typeof statusColors]}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {post.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-sm">
                          <div className="flex items-center gap-2 text-gray-400">
                            <Eye className="w-4 h-4" />
                            <span>{post.views.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-400">
                            <span>💬</span>
                            <span>{post.comments}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        {post.date}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {post.status === 'pending' && (
                            <>
                              <button className="p-2 rounded-lg bg-cyber-lime/20 text-cyber-lime hover:bg-cyber-lime/30 transition-colors" title="Approve">
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors" title="Reject">
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all" title="View">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No posts found matching your criteria</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-gray-400 text-sm">
            Showing <span className="font-semibold text-white">{filteredPosts.length}</span> of{' '}
            <span className="font-semibold text-white">{mockPosts.length}</span> posts
          </p>
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
