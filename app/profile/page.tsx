'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser, signOut } from '@/lib/actions/auth'
import { updateUserProfile } from '@/lib/actions/users'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import type { UserProfile } from '@/lib/types/database'

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [prefs, setPrefs] = useState({
    emailNotifications: true,
    weeklyNewsletter: true,
    commentNotifications: false,
  })

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        window.location.href = '/auth/signin'
        return
      }
      setUser(currentUser)
    } catch {
      window.location.href = '/auth/signin'
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-charcoal flex items-center justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-electric-cyan border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-deep-charcoal">
      <Navbar />
      <div className="pt-24 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-xs text-electric-cyan hover:text-electric-cyan/80 transition-colors mb-3 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-2xl font-bold text-white mb-1">Profile</h1>
          <p className="text-sm text-gray-500">Manage your account settings</p>
        </div>

        {/* Profile Card */}
        <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-6 mb-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-electric-cyan flex-shrink-0 flex items-center justify-center text-white text-xl font-bold">
              {user.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-white mb-0.5">{user.full_name}</h2>
              <p className="text-xs text-gray-500 mb-0.5">{user.email}</p>
              {user.username && <p className="text-[11px] text-gray-600 mb-1.5">@{user.username}</p>}
              <span className="px-2 py-0.5 rounded bg-electric-cyan/10 text-electric-cyan text-[10px] font-semibold uppercase tracking-wider">
                {user.role}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { value: user.posts_written || 0, label: 'Articles' },
              { value: user.comments_posted || 0, label: 'Comments' },
              { value: user.total_views_received || 0, label: 'Views' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg bg-white/[0.03] p-4 text-center">
                <p className="text-xl font-bold text-white mb-0.5">{stat.value}</p>
                <p className="text-[10px] text-gray-600 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Account Settings */}
        <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-6 mb-4">
          <h3 className="text-sm font-semibold text-white mb-5">Account Settings</h3>

          <form onSubmit={async (e) => {
            e.preventDefault()
            setSaving(true)
            setMessage('')
            try {
              const formData = new FormData(e.currentTarget)
              await updateUserProfile(user.id, {
                full_name: formData.get('full_name') as string,
                bio: formData.get('bio') as string,
                website_url: formData.get('website_url') as string,
                github_url: formData.get('github_url') as string,
              } as Partial<UserProfile>)
              setMessage('Profile updated successfully!')
              await loadUser()
            } catch {
              setMessage('Failed to update profile')
            } finally {
              setSaving(false)
            }
          }} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Full Name</label>
              <input
                type="text"
                name="full_name"
                defaultValue={user.full_name}
                className="w-full px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-sm text-white focus:outline-none focus:ring-1 focus:ring-electric-cyan/50 focus:border-electric-cyan/30"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Email Address</label>
              <input
                type="email"
                disabled
                defaultValue={user.email}
                className="w-full px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-sm text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Bio</label>
              <textarea
                name="bio"
                rows={3}
                defaultValue={user.bio || ''}
                placeholder="Tell us about yourself..."
                className="w-full px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-electric-cyan/50 focus:border-electric-cyan/30 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Website</label>
              <input
                type="url"
                name="website_url"
                defaultValue={user.website_url || ''}
                placeholder="https://yoursite.com"
                className="w-full px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-electric-cyan/50 focus:border-electric-cyan/30"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">GitHub</label>
              <input
                type="url"
                name="github_url"
                defaultValue={user.github_url || ''}
                placeholder="https://github.com/username"
                className="w-full px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-electric-cyan/50 focus:border-electric-cyan/30"
              />
            </div>

            {message && (
              <p className={`text-xs font-medium ${message.includes('success') ? 'text-cyber-lime' : 'text-red-400'}`}>
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-lg bg-electric-cyan text-white text-sm font-medium hover:bg-electric-cyan/90 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Preferences */}
        <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-6">
          <h3 className="text-sm font-semibold text-white mb-5">Preferences</h3>

          <div className="space-y-4">
            {[
              { key: 'emailNotifications' as const, title: 'Email Notifications', desc: 'Receive email updates about new content' },
              { key: 'weeklyNewsletter' as const, title: 'Weekly Newsletter', desc: 'Get curated DevOps content weekly' },
              { key: 'commentNotifications' as const, title: 'Comment Notifications', desc: 'Get notified when someone replies' },
            ].map((pref) => (
              <div key={pref.key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{pref.title}</p>
                  <p className="text-[11px] text-gray-600">{pref.desc}</p>
                </div>
                <button
                  onClick={() => setPrefs(p => ({ ...p, [pref.key]: !p[pref.key] }))}
                  className={`w-10 h-5.5 rounded-full relative transition-colors ${prefs[pref.key] ? 'bg-electric-cyan/30' : 'bg-white/[0.06]'}`}
                >
                  <div className={`w-4.5 h-4.5 rounded-full absolute top-0.5 transition-all ${prefs[pref.key] ? 'right-0.5 bg-electric-cyan' : 'left-0.5 bg-gray-500'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
