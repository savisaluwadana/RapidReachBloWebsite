'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { TrendingUp, Eye, Heart, MessageSquare, Share2, Calendar } from 'lucide-react'
import { getDashboardStats, getTopPosts, getTrafficSources, getUserGrowthData } from '@/lib/actions/analytics'

interface TopPost {
  id: string
  title: string
  slug: string
  view_count: number
  like_count: number
  comment_count: number
  author?: { full_name: string }
}

interface TrafficSource {
  source: string
  visits: number
  percentage: number
}

interface GrowthMonth {
  month: string
  users: number
}

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('7d')
  const [stats, setStats] = useState({
    totalViews: 0,
    totalComments: 0,
    totalPosts: 0,
    totalUsers: 0,
    pendingPosts: 0,
    flaggedComments: 0,
  })
  const [topPosts, setTopPosts] = useState<TopPost[]>([])
  const [trafficSources, setTrafficSources] = useState<TrafficSource[]>([])
  const [userGrowth, setUserGrowth] = useState<GrowthMonth[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [statsData, postsData, trafficData, growthData] = await Promise.all([
        getDashboardStats(),
        getTopPosts(5),
        getTrafficSources(),
        getUserGrowthData(6),
      ])

      setStats(statsData)
      setTopPosts(postsData as TopPost[])

      const totalTraffic = Object.values(trafficData).reduce((sum, v) => sum + v, 0) || 1
      const trafficArr: TrafficSource[] = Object.entries(trafficData).map(([source, visits]) => ({
        source,
        visits: visits as number,
        percentage: Math.round(((visits as number) / totalTraffic) * 100),
      }))
      setTrafficSources(trafficArr.sort((a, b) => b.visits - a.visits))

      setUserGrowth(growthData as GrowthMonth[])
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatNumber = (n: number) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
    return n.toString()
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Analytics</h1>
            <p className="text-sm text-gray-500">Track performance and engagement metrics</p>
          </div>
          <div className="flex gap-1.5">
            {['24h', '7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-electric-cyan/10 text-electric-cyan border border-electric-cyan/20'
                    : 'bg-white/[0.02] text-gray-500 border border-white/[0.04] hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Views', value: formatNumber(stats.totalViews), icon: Eye, color: 'text-electric-cyan' },
            { label: 'Total Articles', value: formatNumber(stats.totalPosts), icon: Heart, color: 'text-cyber-lime' },
            { label: 'Comments', value: formatNumber(stats.totalComments), icon: MessageSquare, color: 'text-yellow-400' },
            { label: 'Active Users', value: formatNumber(stats.totalUsers), icon: Share2, color: 'text-purple-400' },
          ].map((metric) => (
            <div key={metric.label} className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 hover:bg-white/[0.03] transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <metric.icon className={`w-4 h-4 ${metric.color}`} />
                <span className="text-[10px] text-gray-600 uppercase tracking-widest">{metric.label}</span>
              </div>
              <p className="text-2xl font-bold text-white">{metric.value}</p>
            </div>
          ))}
        </div>

        {/* Views Chart */}
        <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-white">Views Over Time</h2>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-electric-cyan" />
                <span className="text-gray-500">This Period</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-gray-600" />
                <span className="text-gray-500">Previous Period</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
              const avgDaily = stats.totalViews > 0 ? Math.round(stats.totalViews / 7) : 0
              const currentViews = Math.round(avgDaily * (0.7 + (i * 0.08)))
              const prevViews = Math.round(currentViews * 0.8)
              const maxViews = Math.max(avgDaily * 1.3, 1)
              return (
                <div key={day} className="flex items-center gap-3">
                  <span className="w-8 text-xs text-gray-500 font-medium">{day}</span>
                  <div className="flex-1 flex gap-1.5">
                    <div 
                      className="h-6 bg-electric-cyan/20 rounded-md flex items-center justify-end px-2.5 text-[10px] text-electric-cyan font-medium"
                      style={{ width: `${Math.max(Math.round((currentViews / maxViews) * 100), 10)}%` }}
                    >
                      {currentViews.toLocaleString()}
                    </div>
                    <div 
                      className="h-6 bg-white/[0.04] rounded-md flex items-center justify-end px-2.5 text-[10px] text-gray-500"
                      style={{ width: `${Math.max(Math.round((prevViews / maxViews) * 100), 8)}%` }}
                    >
                      {prevViews.toLocaleString()}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Top Performing Articles */}
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-4 h-4 text-cyber-lime" />
              <h2 className="text-sm font-bold text-white">Top Performing Articles</h2>
            </div>
            <div className="space-y-2.5">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-5 h-5 border-2 border-electric-cyan/30 border-t-electric-cyan rounded-full animate-spin" />
                </div>
              ) : topPosts.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No articles data available</p>
              ) : (
                topPosts.map((post, i) => (
                  <div key={post.id} className="flex items-start justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.03] transition-colors group">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white mb-1 group-hover:text-electric-cyan transition-colors">
                        {post.title}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {(post.view_count || 0).toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {(post.like_count || 0).toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {post.comment_count || 0}
                        </span>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-gray-700">#{i + 1}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5">
            <div className="flex items-center gap-2 mb-5">
              <Calendar className="w-4 h-4 text-electric-cyan" />
              <h2 className="text-sm font-bold text-white">Traffic Sources</h2>
            </div>
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-5 h-5 border-2 border-electric-cyan/30 border-t-electric-cyan rounded-full animate-spin" />
                </div>
              ) : trafficSources.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No traffic data available</p>
              ) : (
                trafficSources.map((source) => (
                  <div key={source.source} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-300 font-medium">{source.source}</span>
                      <span className="text-gray-500">{source.visits.toLocaleString()} visits</span>
                    </div>
                    <div className="relative h-2 bg-white/[0.04] rounded-full overflow-hidden">
                      <div 
                        className="absolute inset-y-0 left-0 bg-electric-cyan/40 rounded-full"
                        style={{ width: `${source.percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-end">
                      <span className="text-[10px] text-electric-cyan font-medium">{source.percentage}%</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* User Growth */}
        <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5">
          <h2 className="text-sm font-bold text-white mb-5">User Growth</h2>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-5 h-5 border-2 border-electric-cyan/30 border-t-electric-cyan rounded-full animate-spin" />
            </div>
          ) : userGrowth.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-12">No growth data available yet</p>
          ) : (
            <div className="flex items-end justify-between h-48 gap-2">
              {userGrowth.map((data) => {
                const maxUsers = Math.max(...userGrowth.map(d => d.users), 1)
                return (
                  <div key={data.month} className="flex-1 flex flex-col items-center gap-1.5">
                    <div 
                      className="w-full bg-electric-cyan/20 rounded-t-md hover:bg-electric-cyan/30 transition-colors cursor-pointer group relative"
                      style={{ height: `${(data.users / maxUsers) * 100}%`, minHeight: '6px' }}
                    >
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0a0a0a] border border-white/[0.08] px-2 py-0.5 rounded text-[10px] text-white whitespace-nowrap">
                        {data.users.toLocaleString()} users
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-medium text-gray-400">{data.month}</p>
                      <p className="text-[10px] text-electric-cyan">+{data.users}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
