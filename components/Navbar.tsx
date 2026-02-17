'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Menu, X, LayoutDashboard, LogOut, User as UserIcon, ChevronDown } from 'lucide-react'
import { getCurrentUser, signOut } from '@/lib/actions/auth'
import type { UserProfile } from '@/lib/types/database'

const navLinks = [
  { label: 'Articles', href: '/blog' },
  { label: 'Learning Paths', href: '/learning-paths' },
  { label: 'News', href: '/news' },
  { label: 'About', href: '/about' },
]

const categories = ['All', 'Orchestration', 'IaC', 'CI/CD & GitOps', 'Service Mesh', 'Cloud', 'Observability', 'Security', 'Platform Eng.']

const categoryToSlug: Record<string, string> = {
  'Orchestration': 'kubernetes',
  'IaC': 'terraform',
  'CI/CD & GitOps': 'cicd',
  'Service Mesh': 'service-mesh',
  'Cloud': 'cloud',
  'Observability': 'observability',
  'Security': 'security',
  'Platform Eng.': 'platform-engineering',
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    loadUser()
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  const loadUser = async () => {
    const currentUser = await getCurrentUser()
    setUser(currentUser)
  }

  const handleLogout = async () => {
    await signOut()
    setUser(null)
    setShowUserMenu(false)
    window.location.href = '/'
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <>
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-deep-charcoal/80 backdrop-blur-2xl border-b border-white/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.5)]'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="relative w-8 h-8 rounded-lg bg-white/[0.08] border border-white/[0.1] flex items-center justify-center transition-transform group-hover:scale-105">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                RapidReach
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(link.href)
                      ? 'text-white bg-white/[0.06]'
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <button
                onClick={() => document.dispatchEvent(new CustomEvent('open-command-palette'))}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.06] transition-colors"
              >
                <Search className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs text-gray-500">Search</span>
                <kbd className="ml-3 px-1.5 py-0.5 rounded bg-white/[0.06] text-[10px] text-gray-500 font-mono">⌘K</kbd>
              </button>

              {user ? (
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.06] transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-white/[0.1] border border-white/[0.12] flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold">{user.full_name.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="text-sm text-white font-medium">{user.full_name.split(' ')[0]}</span>
                    <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {showUserMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                      <div className="absolute right-0 mt-2 w-56 rounded-xl bg-deep-charcoal-50 border border-white/[0.08] shadow-glass p-1.5 z-50">
                        <div className="px-3 py-2.5 mb-1">
                          <p className="text-sm font-semibold text-white truncate">{user.full_name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <div className="h-px bg-white/[0.06] my-1" />

                        {user.role === 'admin' && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/[0.06] text-gray-300 hover:text-white transition-colors text-sm"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            Admin Panel
                          </Link>
                        )}

                        <Link
                          href="/profile"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/[0.06] text-gray-300 hover:text-white transition-colors text-sm"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <UserIcon className="w-4 h-4" />
                          Profile
                        </Link>

                        <div className="h-px bg-white/[0.06] my-1" />

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors text-sm"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/signin"
                  className="hidden md:flex px-4 py-1.5 rounded-lg bg-electric-cyan text-white text-sm font-medium hover:bg-electric-cyan/90 transition-colors"
                >
                  Sign In
                </Link>
              )}

              {/* Mobile toggle */}
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-white/[0.06] transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="w-5 h-5 text-gray-300" /> : <Menu className="w-5 h-5 text-gray-300" />}
              </button>
            </div>
          </div>

          {/* Category pills (desktop) */}
          <div className="hidden lg:flex items-center gap-1.5 pb-3 overflow-x-auto no-scrollbar">
            {categories.map((cat) => {
              const href = cat === 'All' ? '/blog' : `/category/${categoryToSlug[cat] || cat.toLowerCase()}`
              const active = cat === 'All' ? pathname === '/blog' : pathname === href
              return (
                <Link
                  key={cat}
                  href={href}
                  className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-electric-cyan/15 text-electric-cyan'
                      : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]'
                  }`}
                >
                  {cat}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-deep-charcoal border-l border-white/[0.06] p-6 overflow-y-auto">
            <div className="flex justify-end mb-6">
              <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-lg hover:bg-white/[0.06]">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {user && (
              <div className="pb-4 mb-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/[0.1] border border-white/[0.12] flex items-center justify-center">
                    <span className="text-white font-bold">{user.full_name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{user.full_name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-1 mb-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.href) ? 'bg-white/[0.06] text-white' : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Mobile categories */}
            <div className="mb-6">
              <p className="text-xs text-gray-600 uppercase tracking-wider mb-2 px-3">Categories</p>
              <div className="space-y-0.5">
                {categories.filter(c => c !== 'All').map((cat) => (
                  <Link
                    key={cat}
                    href={`/category/${categoryToSlug[cat] || cat.toLowerCase()}`}
                    className="block px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-300 hover:bg-white/[0.04] transition-colors"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-white/[0.06]">
              {user ? (
                <>
                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-electric-cyan hover:bg-electric-cyan/10 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Admin Panel
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                  >
                    <UserIcon className="w-4 h-4" />
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="block w-full px-4 py-2.5 rounded-lg bg-electric-cyan text-white text-sm font-medium text-center hover:bg-electric-cyan/90 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-gray-300 text-sm font-medium text-center hover:bg-white/[0.06] transition-colors"
                  >
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
