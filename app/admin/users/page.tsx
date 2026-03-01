'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Plus, Search, Shield, UserCheck, UserX, Mail, Calendar, TrendingUp } from 'lucide-react'
import { getUsers, updateUserRole, toggleUserStatus } from '@/lib/actions/users'
import { getCurrentUser } from '@/lib/actions/auth'
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

  const handleChangeRole = async (targetUserId: string) => {
    try {
      const admin = await getCurrentUser()
      if (!admin) {
        alert('You must be signed in as an admin to change roles')
        return
      }
      const newRole = window.prompt('Enter new role (reader, contributor, editor, admin):')
      if (!newRole) return
      const role = newRole.trim().toLowerCase()
      if (!['reader','contributor','editor','admin'].includes(role)) {
        alert('Invalid role')
        return
      }
      await updateUserRole(targetUserId, role, admin.id)
      await loadUsers()
    } catch (err) {
      console.error('Failed to update role:', err)
      alert('Failed to update role')
    }
  }

  const handleToggleStatus = async (targetUserId: string) => {
    try {
      const admin = await getCurrentUser()
      if (!admin) {
        alert('You must be signed in as an admin to perform this action')
        return
      }
      // confirm
      if (!confirm('Are you sure?')) return
      await toggleUserStatus(targetUserId, admin.id)
      await loadUsers()
    } catch (err) {
      console.error('Failed to toggle status:', err)
      alert('Failed to toggle status')
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

  const roleColors: Record<string, string> = {
    admin: 'bg-red-500/10 text-red-400',
    editor: 'bg-purple-500/10 text-purple-400',
    contributor: 'bg-electric-cyan/10 text-electric-cyan',
    reader: 'bg-gray-500/10 text-gray-500',
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">User Management</h1>
            <p className="text-sm text-gray-500">Manage users, roles, and permissions</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-electric-cyan text-white text-sm font-medium hover:bg-electric-cyan/90 transition-colors">
            <Plus className="w-4 h-4" />
            Invite User
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Users', value: totalCount.toLocaleString(), icon: UserCheck, color: 'text-electric-cyan' },
            { label: 'Contributors', value: contributorCount.toString(), icon: TrendingUp, color: 'text-cyber-lime' },
            { label: 'Pending', value: pendingCount.toString(), icon: UserX, color: 'text-yellow-400' },
            { label: 'New This Month', value: `+${newThisMonth}`, icon: Calendar, color: 'text-electric-cyan' },
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
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04] text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-electric-cyan/30"
            />
          </div>
          <div className="flex gap-1.5">
            {['all', 'admin', 'editor', 'contributor', 'reader'].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3.5 py-2.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                  roleFilter === role
                    ? 'bg-electric-cyan/10 text-electric-cyan border border-electric-cyan/20'
                    : 'bg-white/[0.02] text-gray-500 border border-white/[0.04] hover:text-white'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Users Grid */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-5 h-5 border-2 border-electric-cyan/30 border-t-electric-cyan rounded-full animate-spin" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <UserX className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-500 mb-1">No users found</p>
            <p className="text-xs text-gray-600">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 hover:bg-white/[0.03] transition-colors group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-300">{user.full_name?.charAt(0).toUpperCase() || 'U'}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-white group-hover:text-electric-cyan transition-colors">
                        {user.full_name}
                      </h3>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-1.5 mb-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${roleColors[user.role] || 'bg-gray-500/10 text-gray-500'}`}>
                    <Shield className="w-2.5 h-2.5 inline mr-0.5" />
                    {user.role}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${user.is_active ? 'bg-cyber-lime/10 text-cyber-lime' : 'bg-yellow-400/10 text-yellow-400'}`}>
                    {user.is_active ? 'active' : 'pending'}
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-3 py-3 border-t border-b border-white/[0.04]">
                  <div className="text-center">
                    <p className="text-sm font-bold text-white">{user.posts_written || 0}</p>
                    <p className="text-[10px] text-gray-600">Posts</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-white">{user.comments_posted || 0}</p>
                    <p className="text-[10px] text-gray-600">Comments</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-400">{new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                    <p className="text-[10px] text-gray-600">Joined</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleChangeRole(user.id)}
                    className="flex-1 px-3 py-1.5 rounded-md bg-electric-cyan/10 text-electric-cyan hover:bg-electric-cyan/20 transition-colors text-xs font-medium"
                  >
                    Change Role
                  </button>
                  <button className="px-3 py-1.5 rounded-md bg-white/[0.02] border border-white/[0.04] text-gray-500 hover:text-white transition-colors">
                    <Mail className="w-3.5 h-3.5" />
                  </button>
                  {user.is_active ? (
                    <button
                      onClick={() => handleToggleStatus(user.id)}
                      className="px-3 py-1.5 rounded-md bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400/20 transition-colors"
                    >
                      Suspend
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleStatus(user.id)}
                      className="px-3 py-1.5 rounded-md bg-cyber-lime/10 text-cyber-lime hover:bg-cyber-lime/20 transition-colors"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
