'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Plus, Search, Eye, Edit, Trash2, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { getPosts, deletePost } from '@/lib/actions/posts'
import type { Post } from '@/lib/types/database'

export default function ArticlesManagement() {
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
    if (!confirm('Are you sure you want to delete this article?')) return
    
    try {
      await deletePost(postId)
      await loadPosts()
    } catch (error) {
      console.error('Failed to delete article:', error)
      alert('Failed to delete article')
    }
  }

  const filteredPosts = posts.filter(post => {
    const matchesFilter = filter === 'all' || post.status === filter
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.author?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const statusColors = {
    published: 'bg-cyber-lime/10 text-cyber-lime',
    pending: 'bg-yellow-400/10 text-yellow-400',
    draft: 'bg-gray-500/10 text-gray-500',
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
            <h1 className="text-2xl font-bold text-white mb-1">Articles Management</h1>
            <p className="text-sm text-gray-500">Manage all articles and approvals</p>
          </div>
          <Link href="/admin/posts/new">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-electric-cyan text-white text-sm font-medium hover:bg-electric-cyan/90 transition-colors">
              <Plus className="w-4 h-4" />
              New Article
            </button>
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search articles by title or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04] text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-electric-cyan/30"
            />
          </div>
          <div className="flex gap-1.5">
            {['all', 'published', 'pending', 'draft'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3.5 py-2.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                  filter === status
                    ? 'bg-electric-cyan/10 text-electric-cyan border border-electric-cyan/20'
                    : 'bg-white/[0.02] text-gray-500 border border-white/[0.04] hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Posts Table */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-5 h-5 border-2 border-electric-cyan/30 border-t-electric-cyan rounded-full animate-spin" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <Edit className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-500 mb-1">No articles found</p>
            <p className="text-xs text-gray-600">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-white/[0.04] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/[0.04]">
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Article</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-600 uppercase tracking-widest hidden md:table-cell">Author</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Status</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-600 uppercase tracking-widest hidden lg:table-cell">Stats</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-600 uppercase tracking-widest hidden lg:table-cell">Date</th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {filteredPosts.map((post) => {
                    const StatusIcon = statusIcons[post.status as keyof typeof statusIcons]
                    return (
                      <tr key={post.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-white mb-0.5">{post.title}</p>
                            <div className="flex items-center flex-wrap gap-1.5">
                              {(post.categories?.length ? post.categories : [post.category]).map(cat => (
                                <span key={cat} className="text-[10px] px-2 py-0.5 rounded-full bg-electric-cyan/10 text-electric-cyan font-medium">
                                  {cat}
                                </span>
                              ))}
                              <span className="text-xs text-gray-600">{post.estimated_read_time || 5} min</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
                              <span className="text-[10px] font-medium text-gray-300">{post.author?.full_name?.charAt(0) || 'U'}</span>
                            </div>
                            <span className="text-xs text-gray-400">{post.author?.full_name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${statusColors[post.status as keyof typeof statusColors]}`}>
                            <StatusIcon className="w-3 h-3" />
                            {post.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5" />
                              {post.view_count.toLocaleString()}
                            </span>
                            <span>💬 {post.comment_count}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-xs text-gray-500">
                            {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/blog/${post.slug}`}>
                              <button className="p-1.5 rounded-md hover:bg-white/[0.06] text-gray-500 hover:text-white transition-colors" title="View">
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </Link>
                            <Link href={`/admin/posts/edit/${post.id}`}>
                              <button className="p-1.5 rounded-md hover:bg-electric-cyan/10 text-gray-500 hover:text-electric-cyan transition-colors" title="Edit">
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                            </Link>
                            <button 
                              onClick={() => handleDelete(post.id)}
                              className="p-1.5 rounded-md hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors" 
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Showing <span className="font-medium text-gray-400">{filteredPosts.length}</span> of{' '}
            <span className="font-medium text-gray-400">{posts.length}</span> posts
          </p>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 rounded-md bg-white/[0.02] border border-white/[0.04] text-xs text-gray-500 hover:text-white transition-colors">
              Previous
            </button>
            <button className="px-3 py-1.5 rounded-md bg-electric-cyan/10 text-electric-cyan border border-electric-cyan/20 text-xs font-medium">
              1
            </button>
            <button className="px-3 py-1.5 rounded-md bg-white/[0.02] border border-white/[0.04] text-xs text-gray-500 hover:text-white transition-colors">
              2
            </button>
            <button className="px-3 py-1.5 rounded-md bg-white/[0.02] border border-white/[0.04] text-xs text-gray-500 hover:text-white transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
