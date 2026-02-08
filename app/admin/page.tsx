import AdminLayout from '@/components/AdminLayout'
import { BarChart3, Users, FileText, MessageSquare, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react'

export default function AdminDashboard() {
  const stats = [
    { name: 'Total Posts', value: '1,234', change: '+12%', icon: FileText, color: 'electric-cyan' },
    { name: 'Active Users', value: '10,459', change: '+8%', icon: Users, color: 'cyber-lime' },
    { name: 'Comments', value: '3,842', change: '+23%', icon: MessageSquare, color: 'electric-cyan' },
    { name: 'Monthly Views', value: '1.2M', change: '+15%', icon: TrendingUp, color: 'cyber-lime' },
  ]

  const pendingPosts = [
    { title: 'Advanced Kubernetes Networking with Cilium', author: 'John Doe', date: '2 hours ago', category: 'Kubernetes' },
    { title: 'GitOps Best Practices for Enterprise', author: 'Jane Smith', date: '5 hours ago', category: 'CI/CD' },
    { title: 'Securing Cloud Native Applications', author: 'Mike Johnson', date: '1 day ago', category: 'Security' },
  ]

  const recentActivity = [
    { type: 'post', action: 'published', item: 'Platform Engineering Guide', user: 'Admin', time: '10 min ago' },
    { type: 'comment', action: 'approved', item: 'Comment on "K8s Patterns"', user: 'Moderator', time: '25 min ago' },
    { type: 'user', action: 'registered', item: 'New user: alex@example.com', user: 'System', time: '1 hour ago' },
    { type: 'post', action: 'rejected', item: 'Spam content detected', user: 'Admin', time: '2 hours ago' },
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
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-6 hover:bg-white/[0.07] transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${stat.color}/10`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}`} />
                </div>
                <span className="text-cyber-lime text-sm font-semibold">{stat.change}</span>
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
                {pendingPosts.length}
              </span>
            </div>

            <div className="space-y-4">
              {pendingPosts.map((post, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-electric-cyan/50 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1 group-hover:text-electric-cyan transition-colors">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <span>by {post.author}</span>
                        <span>•</span>
                        <span>{post.date}</span>
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
              ))}
            </div>

            <button className="w-full mt-4 px-4 py-3 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all font-semibold">
              View All Pending Posts
            </button>
          </div>

          {/* Recent Activity */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-5 h-5 text-electric-cyan" />
              <h2 className="text-xl font-bold text-white">Recent Activity</h2>
            </div>

            <div className="space-y-4">
              {recentActivity.map((activity, i) => {
                const actionColors = {
                  published: 'text-cyber-lime',
                  approved: 'text-electric-cyan',
                  registered: 'text-blue-400',
                  rejected: 'text-red-400',
                }
                
                return (
                  <div key={i} className="flex gap-3">
                    <div className={`w-2 h-2 rounded-full ${actionColors[activity.action as keyof typeof actionColors]} mt-2`} />
                    <div className="flex-1">
                      <p className="text-sm text-white mb-1">
                        <span className="font-semibold">{activity.user}</span>{' '}
                        <span className={actionColors[activity.action as keyof typeof actionColors]}>
                          {activity.action}
                        </span>{' '}
                        {activity.item}
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="p-6 rounded-2xl bg-gradient-cyber text-white hover:opacity-90 transition-opacity text-left group">
            <FileText className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-lg mb-2">Create New Post</h3>
            <p className="text-white/80 text-sm">Start writing a new article</p>
          </button>

          <button className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left group">
            <Users className="w-8 h-8 text-electric-cyan mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-lg mb-2 text-white">Manage Users</h3>
            <p className="text-gray-400 text-sm">View and edit user accounts</p>
          </button>

          <button className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left group">
            <MessageSquare className="w-8 h-8 text-cyber-lime mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-lg mb-2 text-white">Review Comments</h3>
            <p className="text-gray-400 text-sm">Moderate user comments</p>
          </button>
        </div>
      </div>
    </AdminLayout>
  )
}
