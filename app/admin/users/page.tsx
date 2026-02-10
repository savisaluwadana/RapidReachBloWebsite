'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Plus, Search, Shield, UserCheck, UserX, Mail, Calendar, TrendingUp } from 'lucide-react'
import { getUsers, updateUserRole } from '@/lib/actions/users'
import type { UserProfile } from '@/lib/types/database'

export default function UsersManagement() {
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [users, setUsers] = useState<UserProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const data = await getUsers({ limit: 50 })
      setUsers(data)
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const totalCount = users.length
  const contributorCount = users.filter(u => u.role === 'contributor' || u.role === 'editor').length
  const pendingCount = users.filter(u => !u.is_active).length
  const newThisMonth = users.filter(u => {
    const created = new Date(u.created_at)
    const now = new Date()
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
  }).length

  const roleColors = {
    admin: 'bg-red-500/20 text-red-400',
    editor: 'bg-purple-500/20 text-purple-400',
    contributor: 'bg-electric-cyan/20 text-electric-cyan',
    reader: 'bg-gray-500/20 text-gray-400',
  }

  const statusColors = {
    active: 'bg-cyber-lime/20 text-cyber-lime',
    pending: 'bg-yellow-400/20 text-yellow-400',
    suspended: 'bg-red-500/20 text-red-400',
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
            <p className="text-gray-400">Manage users, roles, and permissions</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-cyber text-white font-semibold shadow-glow-md hover:shadow-glow-lg transition-all">
            <Plus className="w-5 h-5" />
            Invite User
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Users', value: '1,234', icon: UserCheck, color: 'electric-cyan' },
            { label: 'Contributors', value: '89', icon: TrendingUp, color: 'cyber-lime' },
            { label: 'Pending Approval', value: '12', icon: UserX, color: 'yellow-400' },
            { label: 'New This Month', value: '+45', icon: Calendar, color: 'electric-cyan' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <div className="flex items-center justify-between mb-3">
                <stat.icon className={`w-5 h-5 text-${stat.color}`} />
              </div>
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
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-electric-cyan/50"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'admin', 'editor', 'contributor', 'reader'].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-4 py-3 rounded-xl font-semibold capitalize transition-all ${
                  roleFilter === role
                    ? 'bg-electric-cyan/20 text-electric-cyan'
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="rounded-2xl bg-white/5 border border-white/10 p-6 hover:bg-white/[0.07] transition-all group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-cyber" />
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-electric-cyan transition-colors">
                      {user.name}
                    </h3>
                    <p className="text-sm text-gray-400">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${roleColors[user.role as keyof typeof roleColors]}`}>
                  <Shield className="w-3 h-3 inline mr-1" />
                  {user.role}
                </span>
                <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${statusColors[user.status as keyof typeof statusColors]}`}>
                  {user.status}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4 py-4 border-t border-b border-white/10">
                <div className="text-center">
                  <p className="text-xl font-bold text-white">{user.posts}</p>
                  <p className="text-xs text-gray-400">Posts</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-white">{user.comments}</p>
                  <p className="text-xs text-gray-400">Comments</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-300">{user.joined}</p>
                  <p className="text-xs text-gray-400">Joined</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 rounded-lg bg-electric-cyan/20 text-electric-cyan hover:bg-electric-cyan/30 transition-colors font-semibold text-sm">
                  Edit
                </button>
                <button className="px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                  <Mail className="w-4 h-4" />
                </button>
                {user.status === 'pending' && (
                  <button className="px-4 py-2 rounded-lg bg-cyber-lime/20 text-cyber-lime hover:bg-cyber-lime/30 transition-colors">
                    <UserCheck className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
