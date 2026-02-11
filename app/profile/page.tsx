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
        <div className="animate-spin w-8 h-8 border-2 border-electric-cyan border-t-transparent rounded-full" />
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-electric-cyan hover:text-cyber-lime transition-colors mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Profile</h1>
          <p className="text-gray-400">Manage your account settings</p>
        </div>

        {/* Profile Card */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-8 mb-6">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-cyber flex-shrink-0 flex items-center justify-center text-white text-3xl font-bold">
              {user.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-1">{user.full_name}</h2>
              <p className="text-gray-400 mb-1">{user.email}</p>
              {user.username && <p className="text-gray-500 text-sm mb-2">@{user.username}</p>}
              <span className="px-4 py-1.5 rounded-lg bg-electric-cyan/20 text-electric-cyan font-semibold text-sm capitalize">
                {user.role}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="rounded-xl bg-white/5 p-6">
              <p className="text-3xl font-bold text-white mb-1">{user.posts_written || 0}</p>
              <p className="text-sm text-gray-400">Articles Written</p>
            </div>
            <div className="rounded-xl bg-white/5 p-6">
              <p className="text-3xl font-bold text-white mb-1">{user.comments_posted || 0}</p>
              <p className="text-sm text-gray-400">Comments Posted</p>
            </div>
            <div className="rounded-xl bg-white/5 p-6">
              <p className="text-3xl font-bold text-white mb-1">{user.total_views_received || 0}</p>
              <p className="text-sm text-gray-400">Total Views</p>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-8 mb-6">
          <h3 className="text-xl font-bold text-white mb-6">Account Settings</h3>
          
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
          }} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Full Name</label>
              <input
                type="text"
                name="full_name"
                defaultValue={user.full_name}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-electric-cyan/50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Email Address</label>
              <input
                type="email"
                disabled
                defaultValue={user.email}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Bio</label>
              <textarea
                name="bio"
                rows={4}
                defaultValue={user.bio || ''}
                placeholder="Tell us about yourself..."
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-electric-cyan/50 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Website</label>
              <input
                type="url"
                name="website_url"
                defaultValue={user.website_url || ''}
                placeholder="https://yoursite.com"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-electric-cyan/50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">GitHub</label>
              <input
                type="url"
                name="github_url"
                defaultValue={user.github_url || ''}
                placeholder="https://github.com/username"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-electric-cyan/50"
              />
            </div>

            {message && (
              <p className={`text-sm font-semibold ${message.includes('success') ? 'text-cyber-lime' : 'text-red-400'}`}>
                {message}
              </p>
            )}

            <button 
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-gradient-cyber text-white font-semibold shadow-glow-md hover:shadow-glow-lg transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Preferences */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-8">
          <h3 className="text-xl font-bold text-white mb-6">Preferences</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Email Notifications</p>
                <p className="text-sm text-gray-400">Receive email updates about new content</p>
              </div>
              <button 
                onClick={() => setPrefs(p => ({ ...p, emailNotifications: !p.emailNotifications }))}
                className={`w-14 h-8 rounded-full relative transition-colors ${prefs.emailNotifications ? 'bg-electric-cyan/30' : 'bg-white/10'}`}
              >
                <div className={`w-6 h-6 rounded-full absolute top-1 transition-all ${prefs.emailNotifications ? 'right-1 bg-electric-cyan' : 'left-1 bg-gray-400'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Weekly Newsletter</p>
                <p className="text-sm text-gray-400">Get curated DevOps content weekly</p>
              </div>
              <button 
                onClick={() => setPrefs(p => ({ ...p, weeklyNewsletter: !p.weeklyNewsletter }))}
                className={`w-14 h-8 rounded-full relative transition-colors ${prefs.weeklyNewsletter ? 'bg-electric-cyan/30' : 'bg-white/10'}`}
              >
                <div className={`w-6 h-6 rounded-full absolute top-1 transition-all ${prefs.weeklyNewsletter ? 'right-1 bg-electric-cyan' : 'left-1 bg-gray-400'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Comment Notifications</p>
                <p className="text-sm text-gray-400">Get notified when someone replies to your comments</p>
              </div>
              <button 
                onClick={() => setPrefs(p => ({ ...p, commentNotifications: !p.commentNotifications }))}
                className={`w-14 h-8 rounded-full relative transition-colors ${prefs.commentNotifications ? 'bg-electric-cyan/30' : 'bg-white/10'}`}
              >
                <div className={`w-6 h-6 rounded-full absolute top-1 transition-all ${prefs.commentNotifications ? 'right-1 bg-electric-cyan' : 'left-1 bg-gray-400'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
