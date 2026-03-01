'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { getCurrentUser, signOut } from '@/lib/actions/auth'
import type { UserProfile } from '@/lib/types/database'
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Settings,
  Bell,
  Search,
  Menu,
  X,
  Clock,
  AlertCircle,
  BookOpen
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Posts', href: '/admin/posts', icon: FileText },
  { name: 'Learning Paths', href: '/admin/learning-paths', icon: BookOpen },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Comments', href: '/admin/comments', icon: MessageSquare },
  { name: 'Analytics', href: '/admin/analytics', icon: TrendingUp },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'editor')) {
          router.push('/auth/signin')
          return
        }
        setUser(currentUser)
      } catch {
        router.push('/auth/signin')
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [router])

  const handleLogout = async () => {
    try {
      await signOut()
    } catch {
      window.location.href = '/auth/signin'
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-deep-charcoal flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-electric-cyan/30 border-t-electric-cyan rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-deep-charcoal">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0a0a] border-r border-white/[0.04] transform transition-transform duration-200 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-14 px-5 border-b border-white/[0.04]">
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/[0.08] border border-white/[0.1] flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <div>
                <h1 className="text-sm font-bold text-white leading-tight">RapidReach</h1>
                <p className="text-[10px] text-gray-600">Admin Panel</p>
              </div>
            </Link>
            <button 
              className="lg:hidden p-1.5"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href + '/'))
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-electric-cyan/10 text-electric-cyan border border-electric-cyan/20'
                      : 'text-gray-500 hover:text-white hover:bg-white/[0.03]'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* User Profile & Actions */}
          <div className="p-3 border-t border-white/[0.04] space-y-1.5">
            <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] mb-2">
              <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium text-gray-300">{user.full_name?.charAt(0).toUpperCase() || 'U'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{user.full_name}</p>
                <p className="text-[10px] text-gray-600 truncate">{user.email}</p>
              </div>
            </div>
            
            <Link
              href="/"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-gray-500 hover:text-white hover:bg-white/[0.04] transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="font-medium">Back to Site</span>
            </Link>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-red-500/5 border border-red-500/10 text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-14 bg-deep-charcoal/95 backdrop-blur-sm border-b border-white/[0.04]">
          <div className="flex items-center justify-between h-full px-5">
            <button
              className="lg:hidden p-1.5 rounded-md hover:bg-white/[0.04]"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5 text-gray-500" />
            </button>

            {/* Search */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-5">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search posts, users, comments..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.04] text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-electric-cyan/30"
                />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-yellow-400" />
                  <span className="text-xs text-white font-medium">5</span>
                  <span className="text-[10px] text-gray-600">Pending</span>
                </div>
                <div className="w-px h-4 bg-white/[0.06]" />
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-xs text-white font-medium">12</span>
                  <span className="text-[10px] text-gray-600">Flagged</span>
                </div>
              </div>

              <button className="relative p-1.5 rounded-md hover:bg-white/[0.04]">
                <Bell className="w-4 h-4 text-gray-500" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-cyber-lime rounded-full" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-5">
          {children}
        </main>
      </div>
    </div>
  )
}
