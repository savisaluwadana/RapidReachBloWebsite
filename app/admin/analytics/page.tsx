'use client'

import { useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { TrendingUp, Eye, Heart, MessageSquare, Share2, Calendar } from 'lucide-react'

const mockTopPosts = [
  { title: 'Kubernetes 1.30: What\'s New', views: 45200, engagement: 2340, comments: 128 },
  { title: 'Terraform Best Practices 2026', views: 38900, engagement: 1876, comments: 94 },
  { title: 'GitOps with ArgoCD', views: 32100, engagement: 1654, comments: 87 },
  { title: 'Platform Engineering Guide', views: 29800, engagement: 1432, comments: 76 },
  { title: 'CI/CD Pipeline Optimization', views: 25600, engagement: 1298, comments: 62 },
]

const mockTrafficSources = [
  { source: 'Direct', visits: 45200, percentage: 38 },
  { source: 'Google', visits: 32100, percentage: 27 },
  { source: 'Social Media', visits: 24300, percentage: 20 },
  { source: 'Referrals', visits: 12800, percentage: 11 },
  { source: 'Other', visits: 4800, percentage: 4 },
]

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('7d')

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
            <p className="text-gray-400">Track performance and engagement metrics</p>
          </div>
          <div className="flex gap-2">
            {['24h', '7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  timeRange === range
                    ? 'bg-electric-cyan/20 text-electric-cyan'
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              label: 'Total Views', 
              value: '1.2M', 
              change: '+15.3%', 
              icon: Eye, 
              color: 'electric-cyan',
              trend: [20, 35, 28, 42, 38, 52, 48, 65, 58, 72, 68, 85]
            },
            { 
              label: 'Engagement', 
              value: '8.4K', 
              change: '+23.1%', 
              icon: Heart, 
              color: 'cyber-lime',
              trend: [15, 22, 28, 25, 35, 42, 38, 48, 52, 58, 62, 68]
            },
            { 
              label: 'Comments', 
              value: '3.8K', 
              change: '+18.7%', 
              icon: MessageSquare, 
              color: 'yellow-400',
              trend: [10, 15, 18, 22, 25, 28, 32, 35, 40, 42, 48, 52]
            },
            { 
              label: 'Shares', 
              value: '2.1K', 
              change: '+12.4%', 
              icon: Share2, 
              color: 'purple-400',
              trend: [8, 12, 15, 18, 22, 25, 28, 32, 35, 38, 42, 45]
            },
          ].map((metric) => (
            <div key={metric.label} className="rounded-2xl bg-white/5 border border-white/10 p-6 hover:bg-white/[0.07] transition-all group">
              <div className="flex items-center justify-between mb-4">
                <metric.icon className={`w-6 h-6 text-${metric.color}`} />
                <span className={`text-sm font-semibold text-${metric.color}`}>{metric.change}</span>
              </div>
              <p className="text-3xl font-bold text-white mb-1">{metric.value}</p>
              <p className="text-sm text-gray-400 mb-4">{metric.label}</p>
              
              {/* Mini Chart */}
              <div className="flex items-end gap-1 h-12">
                {metric.trend.map((value, i) => (
                  <div
                    key={i}
                    className={`flex-1 bg-gradient-to-t from-${metric.color} to-${metric.color}/50 rounded-t opacity-50 group-hover:opacity-100 transition-opacity`}
                    style={{ height: `${value}%` }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Views Chart */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Views Over Time</h2>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-electric-cyan" />
                <span className="text-gray-400">This Period</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-500" />
                <span className="text-gray-400">Previous Period</span>
              </div>
            </div>
          </div>
          
          {/* Simplified Bar Chart */}
          <div className="space-y-4">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
              <div key={day} className="flex items-center gap-4">
                <span className="w-12 text-sm text-gray-400 font-semibold">{day}</span>
                <div className="flex-1 flex gap-2">
                  <div 
                    className="h-8 bg-gradient-to-r from-electric-cyan to-electric-cyan/50 rounded-lg flex items-center justify-end px-3 text-white text-sm font-semibold"
                    style={{ width: `${60 + i * 5}%` }}
                  >
                    {(12000 + i * 2000).toLocaleString()}
                  </div>
                  <div 
                    className="h-8 bg-white/10 rounded-lg flex items-center justify-end px-3 text-gray-400 text-sm"
                    style={{ width: `${50 + i * 4}%` }}
                  >
                    {(10000 + i * 1500).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performing Posts */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-cyber-lime" />
              <h2 className="text-xl font-bold text-white">Top Performing Posts</h2>
            </div>
            <div className="space-y-4">
              {mockTopPosts.map((post, i) => (
                <div key={i} className="flex items-start justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all group">
                  <div className="flex-1">
                    <p className="font-semibold text-white mb-2 group-hover:text-electric-cyan transition-colors">
                      {post.title}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {post.views.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {post.engagement.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {post.comments}
                      </span>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-gray-600">#{i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-5 h-5 text-electric-cyan" />
              <h2 className="text-xl font-bold text-white">Traffic Sources</h2>
            </div>
            <div className="space-y-4">
              {mockTrafficSources.map((source) => (
                <div key={source.source} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white font-semibold">{source.source}</span>
                    <span className="text-gray-400">{source.visits.toLocaleString()} visits</span>
                  </div>
                  <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-electric-cyan to-cyber-lime rounded-full"
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-end">
                    <span className="text-xs text-electric-cyan font-semibold">{source.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Growth */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <h2 className="text-xl font-bold text-white mb-6">User Growth</h2>
          <div className="flex items-end justify-between h-64 gap-2">
            {[
              { month: 'Jan', users: 4200, new: 820 },
              { month: 'Feb', users: 5100, new: 900 },
              { month: 'Mar', users: 6400, new: 1300 },
              { month: 'Apr', users: 7200, new: 800 },
              { month: 'May', users: 8900, new: 1700 },
              { month: 'Jun', users: 10459, new: 1559 },
            ].map((data) => (
              <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-gradient-to-t from-electric-cyan to-cyber-lime rounded-t-lg hover:shadow-glow-md transition-all cursor-pointer group relative"
                  style={{ height: `${(data.users / 10459) * 100}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 px-2 py-1 rounded text-xs text-white whitespace-nowrap">
                    {data.users.toLocaleString()} users
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-white">{data.month}</p>
                  <p className="text-xs text-cyber-lime">+{data.new}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
