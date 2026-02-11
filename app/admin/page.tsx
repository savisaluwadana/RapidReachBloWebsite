import AdminLayout from '@/components/AdminLayout'
import { Users, FileText, MessageSquare, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react'
import { getDashboardStats } from '@/lib/actions/analytics'
import { getPosts } from '@/lib/actions/posts'
import Link from 'next/link'

export default async function AdminDashboard() {
  // Fetch real dashboard stats
  const stats = await getDashboardStats()
  
  // Fetch pending posts
  const pendingPostsData = await getPosts({ status: 'draft', limit: 3 })
  
  const dashboardStats = [
    { name: 'Total Posts', value: stats.totalPosts.toLocaleString(), icon: FileText, color: 'electric-cyan' },
    { name: 'Active Users', value: stats.totalUsers.toLocaleString(), icon: Users, color: 'cyber-lime' },
    { name: 'Comments', value: stats.totalComments.toLocaleString(), icon: MessageSquare, color: 'electric-cyan' },
    { name: 'Monthly Views', value: stats.totalViews > 1000 ? `${(stats.totalViews / 1000).toFixed(1)}K` : stats.totalViews.toString(), icon: TrendingUp, color: 'cyber-lime' },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
          <p className="text-gray-400">Welcome back! Here's what's happening with your blog.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardStats.map((stat) => (
            <div
              key={stat.name}
              className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-6 hover:bg-white/[0.07] transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${stat.color}/10`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}`} />
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">{stat.name}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`absolute inset-0 bg-gradient-to-br from-${stat.color}/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Approvals */}
          <div className="lg:col-span-2 rounded-2xl bg-white/5 border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-yellow-400" />
                <h2 className="text-xl font-bold text-white">Pending Approvals</h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-400 text-sm font-semibold">
                {pendingPostsData.length}
              </span>
            </div>

            <div className="space-y-4">
              {pendingPostsData.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No pending posts</p>
                  <p className="text-sm text-gray-500 mt-1">All posts are reviewed!</p>
                </div>
              ) : (
                pendingPostsData.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-electric-cyan/50 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1 group-hover:text-electric-cyan transition-colors">
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <span>by {post.author?.full_name || 'Unknown'}</span>
                          <span>•</span>
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-lg bg-electric-cyan/10 text-electric-cyan text-xs font-semibold">
                        {post.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="flex-1 px-4 py-2 rounded-lg bg-cyber-lime/20 text-cyber-lime hover:bg-cyber-lime/30 transition-colors font-semibold text-sm flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button className="flex-1 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors font-semibold text-sm flex items-center justify-center gap-2">
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Link href="/admin/posts">
              <button className="w-full mt-4 px-4 py-3 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all font-semibold">
                View All Pending Posts
              </button>
            </Link>
          </div>


        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/admin/posts/new">
            <button className="w-full p-6 rounded-2xl bg-gradient-cyber text-white hover:opacity-90 transition-opacity text-left group">
              <FileText className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-lg mb-2">Create New Post</h3>
              <p className="text-white/80 text-sm">Start writing a new article</p>
            </button>
          </Link>

          <Link href="/admin/users">
            <button className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left group">
              <Users className="w-8 h-8 text-electric-cyan mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-lg mb-2 text-white">Manage Users</h3>
              <p className="text-gray-400 text-sm">View and edit user accounts</p>
            </button>
          </Link>

          <Link href="/admin/comments">
            <button className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left group">
              <MessageSquare className="w-8 h-8 text-cyber-lime mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-lg mb-2 text-white">Review Comments</h3>
              <p className="text-gray-400 text-sm">Moderate user comments</p>
            </button>
          </Link>
        </div>
      </div>
    </AdminLayout>
  )
}
