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

      // Transform traffic sources from Record<string, number> to array
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
              value: formatNumber(stats.totalViews), 
              icon: Eye, 
              color: 'electric-cyan',
              trend: [20, 35, 28, 42, 38, 52, 48, 65, 58, 72, 68, 85]
            },
            { 
              label: 'Total Posts', 
              value: formatNumber(stats.totalPosts), 
              icon: Heart, 
              color: 'cyber-lime',
              trend: [15, 22, 28, 25, 35, 42, 38, 48, 52, 58, 62, 68]
            },
            { 
              label: 'Comments', 
              value: formatNumber(stats.totalComments), 
              icon: MessageSquare, 
              color: 'yellow-400',
              trend: [10, 15, 18, 22, 25, 28, 32, 35, 40, 42, 48, 52]
            },
            { 
              label: 'Active Users', 
              value: formatNumber(stats.totalUsers), 
              icon: Share2, 
              color: 'purple-400',
              trend: [8, 12, 15, 18, 22, 25, 28, 32, 35, 38, 42, 45]
            },
          ].map((metric) => (
            <div key={metric.label} className="rounded-2xl bg-white/5 border border-white/10 p-6 hover:bg-white/[0.07] transition-all group">
              <div className="flex items-center justify-between mb-4">
                <metric.icon className={`w-6 h-6 text-${metric.color}`} />
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
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-10 h-10 border-4 border-electric-cyan/30 border-t-electric-cyan rounded-full animate-spin" />
                </div>
              ) : topPosts.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No posts data available</p>
              ) : (
                topPosts.map((post, i) => (
                  <div key={post.id} className="flex items-start justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all group">
                    <div className="flex-1">
                      <p className="font-semibold text-white mb-2 group-hover:text-electric-cyan transition-colors">
                        {post.title}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {(post.view_count || 0).toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {(post.like_count || 0).toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          {post.comment_count || 0}
                        </span>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-gray-600">#{i + 1}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-5 h-5 text-electric-cyan" />
              <h2 className="text-xl font-bold text-white">Traffic Sources</h2>
            </div>
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-10 h-10 border-4 border-electric-cyan/30 border-t-electric-cyan rounded-full animate-spin" />
                </div>
              ) : trafficSources.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No traffic data available</p>
              ) : (
                trafficSources.map((source) => (
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
                ))
              )}
            </div>
          </div>
        </div>

        {/* User Growth */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <h2 className="text-xl font-bold text-white mb-6">User Growth</h2>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 border-4 border-electric-cyan/30 border-t-electric-cyan rounded-full animate-spin" />
            </div>
          ) : userGrowth.length === 0 ? (
            <p className="text-gray-400 text-center py-12">No growth data available yet</p>
          ) : (
            <div className="flex items-end justify-between h-64 gap-2">
              {userGrowth.map((data) => {
                const maxUsers = Math.max(...userGrowth.map(d => d.users), 1)
                return (
                  <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full bg-gradient-to-t from-electric-cyan to-cyber-lime rounded-t-lg hover:shadow-glow-md transition-all cursor-pointer group relative"
                      style={{ height: `${(data.users / maxUsers) * 100}%`, minHeight: '8px' }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 px-2 py-1 rounded text-xs text-white whitespace-nowrap">
                        {data.users.toLocaleString()} users
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-white">{data.month}</p>
                      <p className="text-xs text-cyber-lime">+{data.users}</p>
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
