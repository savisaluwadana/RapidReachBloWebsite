'use client'

import { useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Save, Globe, Shield, Bell, Database, Mail, Palette, Code } from 'lucide-react'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general')

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'api', label: 'API', icon: Code },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Manage your platform configuration</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-electric-cyan/20 text-electric-cyan'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <h2 className="text-xl font-bold text-white mb-6">Site Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Site Name</label>
                  <input
                    type="text"
                    defaultValue="RapidReach Blog"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-electric-cyan/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Tagline</label>
                  <input
                    type="text"
                    defaultValue="DevOps, Platform Engineering & Cloud Native"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-electric-cyan/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Description</label>
                  <textarea
                    rows={3}
                    defaultValue="World-class blog and news platform for DevOps, Platform Engineering, and Cloud Native ecosystems."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-electric-cyan/50 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Site URL</label>
                  <input
                    type="url"
                    defaultValue="https://rapidreach.blog"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-electric-cyan/50"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <h2 className="text-xl font-bold text-white mb-6">Content Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">Auto-publish posts</p>
                    <p className="text-sm text-gray-400">Automatically publish approved posts</p>
                  </div>
                  <button className="w-14 h-8 bg-electric-cyan/20 rounded-full relative">
                    <div className="w-6 h-6 bg-electric-cyan rounded-full absolute top-1 right-1" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">Require approval</p>
                    <p className="text-sm text-gray-400">All posts need admin approval before publishing</p>
                  </div>
                  <button className="w-14 h-8 bg-electric-cyan/20 rounded-full relative">
                    <div className="w-6 h-6 bg-electric-cyan rounded-full absolute top-1 right-1" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">Enable comments</p>
                    <p className="text-sm text-gray-400">Allow users to comment on posts</p>
                  </div>
                  <button className="w-14 h-8 bg-electric-cyan/20 rounded-full relative">
                    <div className="w-6 h-6 bg-electric-cyan rounded-full absolute top-1 right-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <h2 className="text-xl font-bold text-white mb-6">Authentication</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">Two-factor authentication</p>
                    <p className="text-sm text-gray-400">Require 2FA for admin accounts</p>
                  </div>
                  <button className="w-14 h-8 bg-white/10 rounded-full relative">
                    <div className="w-6 h-6 bg-gray-400 rounded-full absolute top-1 left-1" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">Password strength</p>
                    <p className="text-sm text-gray-400">Enforce strong password requirements</p>
                  </div>
                  <button className="w-14 h-8 bg-electric-cyan/20 rounded-full relative">
                    <div className="w-6 h-6 bg-electric-cyan rounded-full absolute top-1 right-1" />
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <h2 className="text-xl font-bold text-white mb-6">Content Moderation</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Spam Filter Sensitivity</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-electric-cyan/50">
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">Auto-flag suspicious comments</p>
                    <p className="text-sm text-gray-400">Automatically flag potentially harmful content</p>
                  </div>
                  <button className="w-14 h-8 bg-electric-cyan/20 rounded-full relative">
                    <div className="w-6 h-6 bg-electric-cyan rounded-full absolute top-1 right-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Database Settings */}
        {activeTab === 'database' && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <h2 className="text-xl font-bold text-white mb-6">Supabase Configuration</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Project URL</label>
                  <input
                    type="url"
                    placeholder="https://xxxxx.supabase.co"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-electric-cyan/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Anon Key</label>
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-electric-cyan/50"
                  />
                </div>
                <div className="rounded-xl bg-yellow-400/10 border border-yellow-400/30 p-4">
                  <p className="text-sm text-yellow-400">
                    ⚠️ These credentials are stored in your .env.local file. Never commit this file to version control.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Email Settings */}
        {activeTab === 'email' && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <h2 className="text-xl font-bold text-white mb-6">SMTP Configuration</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">From Email</label>
                  <input
                    type="email"
                    defaultValue="noreply@rapidreach.blog"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-electric-cyan/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">From Name</label>
                  <input
                    type="text"
                    defaultValue="RapidReach Blog"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-electric-cyan/50"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <h2 className="text-xl font-bold text-white mb-6">Email Notifications</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">New comment notifications</p>
                    <p className="text-sm text-gray-400">Email admins when new comments are posted</p>
                  </div>
                  <button className="w-14 h-8 bg-electric-cyan/20 rounded-full relative">
                    <div className="w-6 h-6 bg-electric-cyan rounded-full absolute top-1 right-1" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">New post notifications</p>
                    <p className="text-sm text-gray-400">Email subscribers when new posts are published</p>
                  </div>
                  <button className="w-14 h-8 bg-electric-cyan/20 rounded-full relative">
                    <div className="w-6 h-6 bg-electric-cyan rounded-full absolute top-1 right-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-cyber text-white font-semibold shadow-glow-md hover:shadow-glow-lg transition-all">
            <Save className="w-5 h-5" />
            Save Changes
          </button>
        </div>
      </div>
    </AdminLayout>
  )
}
