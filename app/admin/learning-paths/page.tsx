'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import Link from 'next/link'
import { Plus, Search, Trash2, Eye, EyeOff, Star, Users, BookOpen, GraduationCap } from 'lucide-react'
import { getAllLearningPaths, deleteLearningPath, toggleLearningPathPublish } from '@/lib/actions/learning-paths'
import type { LearningPath } from '@/lib/actions/learning-paths'

export default function LearningPathsAdmin() {
  const [paths, setPaths] = useState<LearningPath[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')

  useEffect(() => {
    loadPaths()
  }, [])

  const loadPaths = async () => {
    try {
      const data = await getAllLearningPaths({ includeUnpublished: true })
      setPaths(data)
    } catch (error) {
      console.error('Failed to load learning paths:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this learning path? This action cannot be undone.')) return

    try {
      const result = await deleteLearningPath(id)
      if (result.success) {
        await loadPaths()
      } else {
        alert(result.error || 'Failed to delete')
      }
    } catch (error) {
      console.error('Failed to delete:', error)
      alert('Failed to delete learning path')
    }
  }

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const result = await toggleLearningPathPublish(id, !currentStatus)
      if (result.success) {
        await loadPaths()
      } else {
        alert(result.error || 'Failed to update')
      }
    } catch (error) {
      console.error('Failed to toggle publish:', error)
    }
  }

  const filtered = paths.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filter === 'all' ||
                          (filter === 'published' && p.is_published) ||
                          (filter === 'draft' && !p.is_published)
    return matchesSearch && matchesFilter
  })

  const difficultyColor: Record<string, string> = {
    beginner: 'text-cyber-lime bg-cyber-lime/10',
    intermediate: 'text-electric-cyan bg-electric-cyan/10',
    advanced: 'text-orange-400 bg-orange-400/10',
    expert: 'text-red-400 bg-red-400/10',
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Learning Paths</h1>
            <p className="text-sm text-gray-500">Create and manage structured learning experiences</p>
          </div>
          <Link href="/admin/learning-paths/new">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-electric-cyan text-white text-sm font-medium hover:bg-electric-cyan/90 transition-colors">
              <Plus className="w-4 h-4" />
              New Path
            </button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Paths', value: paths.length, icon: BookOpen, color: 'text-electric-cyan' },
            { label: 'Published', value: paths.filter(p => p.is_published).length, icon: Eye, color: 'text-cyber-lime' },
            { label: 'Drafts', value: paths.filter(p => !p.is_published).length, icon: EyeOff, color: 'text-gray-400' },
            { label: 'Total Enrollments', value: paths.reduce((sum, p) => sum + p.enrollment_count, 0), icon: Users, color: 'text-[#5C4EE5]' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-[10px] text-gray-600 uppercase tracking-widest">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value.toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by title or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04] text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-electric-cyan/30"
            />
          </div>
          <div className="flex gap-1.5">
            {(['all', 'published', 'draft'] as const).map((status) => (
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

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-5 h-5 border-2 border-electric-cyan/30 border-t-electric-cyan rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <GraduationCap className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-500 mb-1">No learning paths found</p>
            <p className="text-xs text-gray-600">
              {paths.length === 0 ? 'Create your first learning path to get started.' : 'Try adjusting your search or filters.'}
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-white/[0.04] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/[0.04]">
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Title</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-600 uppercase tracking-widest hidden md:table-cell">Category</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-600 uppercase tracking-widest hidden md:table-cell">Difficulty</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-600 uppercase tracking-widest hidden lg:table-cell">Modules</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-600 uppercase tracking-widest hidden lg:table-cell">Enrollments</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Status</th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {filtered.map((path) => (
                    <tr key={path.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-white">{path.title}</p>
                          <p className="text-xs text-gray-600 line-clamp-1 mt-0.5">{path.description}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs text-gray-400">{path.category}</span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${difficultyColor[path.difficulty] || 'text-gray-400 bg-white/[0.04]'}`}>
                          {path.difficulty}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-xs text-gray-400">{path.modules.length}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-xs text-gray-400">{path.enrollment_count.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          path.is_published
                            ? 'bg-cyber-lime/10 text-cyber-lime'
                            : 'bg-gray-500/10 text-gray-500'
                        }`}>
                          {path.is_published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleTogglePublish(path.id, path.is_published)}
                            title={path.is_published ? 'Unpublish' : 'Publish'}
                            className="p-1.5 rounded-md hover:bg-white/[0.06] text-gray-500 hover:text-white transition-colors"
                          >
                            {path.is_published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleDelete(path.id)}
                            title="Delete"
                            className="p-1.5 rounded-md hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
