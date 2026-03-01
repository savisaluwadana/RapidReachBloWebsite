import AdminLayout from '@/components/AdminLayout'
import { Users, FileText, MessageSquare, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react'
import { getDashboardStats } from '@/lib/actions/analytics'
import { getPosts } from '@/lib/actions/posts'
import Link from 'next/link'

export default async function AdminDashboard() {
  const stats = await getDashboardStats()
  const pendingPostsData = await getPosts({ status: 'draft', limit: 3 })
  
  const dashboardStats = [
    { name: 'Total Posts', value: stats.totalPosts.toLocaleString(), icon: FileText, color: 'text-electric-cyan' },
    { name: 'Active Users', value: stats.totalUsers.toLocaleString(), icon: Users, color: 'text-cyber-lime' },
    { name: 'Comments', value: stats.totalComments.toLocaleString(), icon: MessageSquare, color: 'text-electric-cyan' },
    { name: 'Monthly Views', value: stats.totalViews > 1000 ? `${(stats.totalViews / 1000).toFixed(1)}K` : stats.totalViews.toString(), icon: TrendingUp, color: 'text-cyber-lime' },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Dashboard Overview</h1>
          <p className="text-sm text-gray-500">Welcome back! Here&apos;s what&apos;s happening with your blog.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {dashboardStats.map((stat) => (
            <div
              key={stat.name}
              className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 hover:bg-white/[0.03] transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-[10px] text-gray-600 uppercase tracking-widest">{stat.name}</span>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Pending Approvals */}
          <div className="lg:col-span-2 rounded-xl bg-white/[0.02] border border-white/[0.04] p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-400" />
                <h2 className="text-sm font-bold text-white">Pending Approvals</h2>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400 text-[10px] font-medium">
                {pendingPostsData.length}
              </span>
            </div>

            <div className="space-y-3">
              {pendingPostsData.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No pending posts</p>
                  <p className="text-xs text-gray-600 mt-0.5">All posts are reviewed!</p>
                </div>
              ) : (
                pendingPostsData.map((post) => (
                  <div
                    key={post.id}
                    className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:border-electric-cyan/20 transition-colors group"
                  >
                    <div className="flex items-start justify-between mb-2.5">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-white mb-0.5 group-hover:text-electric-cyan transition-colors">
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>by {post.author?.full_name || 'Unknown'}</span>
                          <span>·</span>
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-electric-cyan/10 text-electric-cyan text-[10px] font-medium">
                        {post.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="flex-1 px-3 py-1.5 rounded-md bg-cyber-lime/10 text-cyber-lime hover:bg-cyber-lime/20 transition-colors text-xs font-medium flex items-center justify-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Approve
                      </button>
                      <button className="flex-1 px-3 py-1.5 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-xs font-medium flex items-center justify-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Link href="/admin/posts">
              <button className="w-full mt-3 px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-xs text-gray-500 hover:text-white hover:bg-white/[0.04] transition-colors font-medium">
                View All Pending Posts
              </button>
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Link href="/admin/posts/new">
            <button className="w-full p-5 rounded-xl bg-electric-cyan text-white hover:bg-electric-cyan/90 transition-colors text-left group">
              <FileText className="w-5 h-5 mb-2.5 group-hover:scale-110 transition-transform" />
              <h3 className="font-medium text-sm mb-1">Create New Post</h3>
              <p className="text-white/70 text-xs">Start writing a new article</p>
            </button>
          </Link>

          <Link href="/admin/users">
            <button className="w-full p-5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors text-left group">
              <Users className="w-5 h-5 text-electric-cyan mb-2.5 group-hover:scale-110 transition-transform" />
              <h3 className="font-medium text-sm mb-1 text-white">Manage Users</h3>
              <p className="text-gray-500 text-xs">View and edit user accounts</p>
            </button>
          </Link>

          <Link href="/admin/comments">
            <button className="w-full p-5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors text-left group">
              <MessageSquare className="w-5 h-5 text-cyber-lime mb-2.5 group-hover:scale-110 transition-transform" />
              <h3 className="font-medium text-sm mb-1 text-white">Review Comments</h3>
              <p className="text-gray-500 text-xs">Moderate user comments</p>
            </button>
          </Link>
        </div>
      </div>
    </AdminLayout>
  )
}
