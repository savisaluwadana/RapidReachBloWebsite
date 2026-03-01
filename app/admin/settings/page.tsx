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
          <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
          <p className="text-sm text-gray-500">Manage your platform configuration</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-electric-cyan/10 text-electric-cyan border border-electric-cyan/20'
                  : 'bg-white/[0.02] text-gray-500 border border-white/[0.04] hover:text-white'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-5">
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5">
              <h2 className="text-sm font-bold text-white mb-4">Site Information</h2>
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-widest mb-1.5">Site Name</label>
                  <input
                    type="text"
                    defaultValue="RapidReach Blog"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04] text-sm text-white focus:outline-none focus:ring-1 focus:ring-electric-cyan/30"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-widest mb-1.5">Tagline</label>
                  <input
                    type="text"
                    defaultValue="DevOps, Platform Engineering & Cloud Native"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04] text-sm text-white focus:outline-none focus:ring-1 focus:ring-electric-cyan/30"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-widest mb-1.5">Description</label>
                  <textarea
                    rows={3}
                    defaultValue="World-class blog and news platform for DevOps, Platform Engineering, and Cloud Native ecosystems."
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04] text-sm text-white focus:outline-none focus:ring-1 focus:ring-electric-cyan/30 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-widest mb-1.5">Site URL</label>
                  <input
                    type="url"
                    defaultValue="https://rapidreach.blog"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04] text-sm text-white focus:outline-none focus:ring-1 focus:ring-electric-cyan/30"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5">
              <h2 className="text-sm font-bold text-white mb-4">Content Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Auto-publish posts</p>
                    <p className="text-xs text-gray-500">Automatically publish approved posts</p>
                  </div>
                  <button className="w-11 h-6 bg-electric-cyan/20 rounded-full relative">
                    <div className="w-4.5 h-4.5 bg-electric-cyan rounded-full absolute top-[3px] right-[3px]" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Require approval</p>
                    <p className="text-xs text-gray-500">All posts need admin approval before publishing</p>
                  </div>
                  <button className="w-11 h-6 bg-electric-cyan/20 rounded-full relative">
                    <div className="w-4.5 h-4.5 bg-electric-cyan rounded-full absolute top-[3px] right-[3px]" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Enable comments</p>
                    <p className="text-xs text-gray-500">Allow users to comment on posts</p>
                  </div>
                  <button className="w-11 h-6 bg-electric-cyan/20 rounded-full relative">
                    <div className="w-4.5 h-4.5 bg-electric-cyan rounded-full absolute top-[3px] right-[3px]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="space-y-5">
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5">
              <h2 className="text-sm font-bold text-white mb-4">Authentication</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Two-factor authentication</p>
                    <p className="text-xs text-gray-500">Require 2FA for admin accounts</p>
                  </div>
                  <button className="w-11 h-6 bg-white/[0.06] rounded-full relative">
                    <div className="w-4.5 h-4.5 bg-gray-500 rounded-full absolute top-[3px] left-[3px]" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Password strength</p>
                    <p className="text-xs text-gray-500">Enforce strong password requirements</p>
                  </div>
                  <button className="w-11 h-6 bg-electric-cyan/20 rounded-full relative">
                    <div className="w-4.5 h-4.5 bg-electric-cyan rounded-full absolute top-[3px] right-[3px]" />
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5">
              <h2 className="text-sm font-bold text-white mb-4">Content Moderation</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-widest mb-1.5">Spam Filter Sensitivity</label>
                  <select className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04] text-sm text-white focus:outline-none focus:ring-1 focus:ring-electric-cyan/30">
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Auto-flag suspicious comments</p>
                    <p className="text-xs text-gray-500">Automatically flag potentially harmful content</p>
                  </div>
                  <button className="w-11 h-6 bg-electric-cyan/20 rounded-full relative">
                    <div className="w-4.5 h-4.5 bg-electric-cyan rounded-full absolute top-[3px] right-[3px]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Database Settings */}
        {activeTab === 'database' && (
          <div className="space-y-5">
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5">
              <h2 className="text-sm font-bold text-white mb-4">Supabase Configuration</h2>
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-widest mb-1.5">Project URL</label>
                  <input
                    type="url"
                    placeholder="https://xxxxx.supabase.co"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04] text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-electric-cyan/30"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-widest mb-1.5">Anon Key</label>
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04] text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-electric-cyan/30"
                  />
                </div>
                <div className="rounded-lg bg-yellow-400/5 border border-yellow-400/20 p-3">
                  <p className="text-xs text-yellow-400/80">
                    ⚠️ These credentials are stored in your .env.local file. Never commit this file to version control.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Email Settings */}
        {activeTab === 'email' && (
          <div className="space-y-5">
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5">
              <h2 className="text-sm font-bold text-white mb-4">SMTP Configuration</h2>
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-widest mb-1.5">From Email</label>
                  <input
                    type="email"
                    defaultValue="noreply@rapidreach.blog"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04] text-sm text-white focus:outline-none focus:ring-1 focus:ring-electric-cyan/30"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-widest mb-1.5">From Name</label>
                  <input
                    type="text"
                    defaultValue="RapidReach Blog"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04] text-sm text-white focus:outline-none focus:ring-1 focus:ring-electric-cyan/30"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5">
              <h2 className="text-sm font-bold text-white mb-4">Email Notifications</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">New comment notifications</p>
                    <p className="text-xs text-gray-500">Email admins when new comments are posted</p>
                  </div>
                  <button className="w-11 h-6 bg-electric-cyan/20 rounded-full relative">
                    <div className="w-4.5 h-4.5 bg-electric-cyan rounded-full absolute top-[3px] right-[3px]" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">New post notifications</p>
                    <p className="text-xs text-gray-500">Email subscribers when new posts are published</p>
                  </div>
                  <button className="w-11 h-6 bg-electric-cyan/20 rounded-full relative">
                    <div className="w-4.5 h-4.5 bg-electric-cyan rounded-full absolute top-[3px] right-[3px]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-electric-cyan text-white text-sm font-medium hover:bg-electric-cyan/90 transition-colors">
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </AdminLayout>
  )
}
