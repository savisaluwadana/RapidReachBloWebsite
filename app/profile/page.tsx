'use client'

import { useEffect, useState } from 'react'
import { getUser, isAdmin, isAuthenticated } from '@/lib/auth'
import Link from 'next/link'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = '/auth/signin'
      return
    }
    
    setUser(getUser())
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-charcoal flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-deep-charcoal py-12 px-6">
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
            <div className="w-24 h-24 rounded-full bg-gradient-cyber flex-shrink-0" />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
              <p className="text-gray-400 mb-2">{user.email}</p>
              <span className="px-4 py-1.5 rounded-lg bg-electric-cyan/20 text-electric-cyan font-semibold text-sm capitalize">
                {user.role}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="rounded-xl bg-white/5 p-6">
              <p className="text-3xl font-bold text-white mb-1">0</p>
              <p className="text-sm text-gray-400">Articles Written</p>
            </div>
            <div className="rounded-xl bg-white/5 p-6">
              <p className="text-3xl font-bold text-white mb-1">0</p>
              <p className="text-sm text-gray-400">Comments Posted</p>
            </div>
            <div className="rounded-xl bg-white/5 p-6">
              <p className="text-3xl font-bold text-white mb-1">0</p>
              <p className="text-sm text-gray-400">Bookmarks</p>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-8 mb-6">
          <h3 className="text-xl font-bold text-white mb-6">Account Settings</h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Full Name</label>
              <input
                type="text"
                defaultValue={user.name}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-electric-cyan/50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Email Address</label>
              <input
                type="email"
                defaultValue={user.email}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-electric-cyan/50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Bio</label>
              <textarea
                rows={4}
                placeholder="Tell us about yourself..."
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-electric-cyan/50 resize-none"
              />
            </div>

            <button className="px-6 py-3 rounded-xl bg-gradient-cyber text-white font-semibold shadow-glow-md hover:shadow-glow-lg transition-all">
              Save Changes
            </button>
          </div>
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
              <button className="w-14 h-8 bg-electric-cyan/20 rounded-full relative">
                <div className="w-6 h-6 bg-electric-cyan rounded-full absolute top-1 right-1" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Weekly Newsletter</p>
                <p className="text-sm text-gray-400">Get curated DevOps content weekly</p>
              </div>
              <button className="w-14 h-8 bg-electric-cyan/20 rounded-full relative">
                <div className="w-6 h-6 bg-electric-cyan rounded-full absolute top-1 right-1" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Comment Notifications</p>
                <p className="text-sm text-gray-400">Get notified when someone replies to your comments</p>
              </div>
              <button className="w-14 h-8 bg-white/10 rounded-full relative">
                <div className="w-6 h-6 bg-gray-400 rounded-full absolute top-1 left-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
