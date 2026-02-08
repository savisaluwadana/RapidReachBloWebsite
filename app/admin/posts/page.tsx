'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Plus, Search, Filter, Eye, Edit, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import { getPosts, deletePost } from '@/lib/actions/posts'
import type { Post } from '@/lib/types/database'

export default function PostsManagement() {
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      const data = await getPosts({ limit: 50 })
      setPosts(data)
    } catch (error) {
      console.error('Failed to load posts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return
    
    try {
      await deletePost(postId)
      await loadPosts()
    } catch (error) {
      console.error('Failed to delete post:', error)
      alert('Failed to delete post')
    }
  }

  const filteredPosts = posts.filter(post => {
    const matchesFilter = filter === 'all' || post.status === filter
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.author?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
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
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="w-12 h-12 border-4 border-electric-cyan/30 border-t-electric-cyan rounded-full animate-spin" />
                      </div>
                    </td>
                  </tr>
                ) : filteredPosts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      No posts found
                    </td>
                  </tr>
                ) : (
                  filteredPosts.map((post) => {
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
                              <span className="text-gray-500 text-xs">{post.read_time} min</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-cyber flex items-center justify-center text-white font-bold text-sm">
                              {post.author?.full_name?.charAt(0) || 'U'}
                            </div>
                            <span className="text-gray-300 text-sm">{post.author?.full_name || 'Unknown'}</span>
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
                              <span>{post.view_count.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400">
                              <span>💬</span>
                              <span>{post.comment_count}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-sm">
                          {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/blog/${post.slug}`}>
                              <button className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors" title="View">
                                <Eye className="w-4 h-4" />
                              </button>
                            </Link>
                            <Link href={`/admin/posts/edit/${post.id}`}>
                              <button className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-electric-cyan hover:bg-electric-cyan/10 transition-colors" title="Edit">
                                <Edit className="w-4 h-4" />
                              </button>
                            </Link>
                            <button 
                              onClick={() => handleDelete(post.id)}
                              className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors" 
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
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
            <span className="font-semibold text-white">{posts.length}</span> posts
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
