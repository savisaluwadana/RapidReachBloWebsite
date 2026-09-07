'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ArrowUpRight,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  User as UserIcon,
  X,
} from 'lucide-react'
import { getCurrentUser, signOut } from '@/lib/actions/auth'
import type { UserProfile } from '@/lib/types/database'

const navLinks = [
  { label: 'Articles', href: '/blog' },
  { label: 'Learning Paths', href: '/learning-paths' },
  { label: 'News', href: '/news' },
  { label: 'About', href: '/about' },
]

function getDisplayName(user: UserProfile) {
  const fullName = user.full_name?.trim()
  if (fullName) return fullName
  return user.email?.split('@')[0] || 'Account'
}

export default function Navbar() {
  const pathname = usePathname()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    let active = true

    const loadUser = async () => {
      try {
        const cached = sessionStorage.getItem('rr_user_cache')
        if (cached) {
          const parsed = JSON.parse(cached) as { data?: UserProfile | null; ts?: number }
          if (parsed.ts && Date.now() - parsed.ts < 5 * 60 * 1000) {
            if (active) setUser(parsed.data ?? null)
            return
          }
        }

        const currentUser = await getCurrentUser()
        if (!active) return
        setUser(currentUser)
        sessionStorage.setItem('rr_user_cache', JSON.stringify({ data: currentUser, ts: Date.now() }))
      } catch (error) {
        console.error('Unable to restore RapidReach session:', error)
        if (active) setUser(null)
        try { sessionStorage.removeItem('rr_user_cache') } catch {}
      }
    }

    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    void loadUser()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      active = false
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  useEffect(() => {
    setIsMenuOpen(false)
    setShowUserMenu(false)
  }, [pathname])

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  const handleLogout = async () => {
    try {
      await signOut()
    } finally {
      setUser(null)
      setShowUserMenu(false)
      try { sessionStorage.removeItem('rr_user_cache') } catch {}
      window.location.assign('/')
    }
  }

  const displayName = user ? getDisplayName(user) : ''
  const firstName = displayName.split(/\s+/)[0]
  const initial = displayName.charAt(0).toUpperCase() || 'R'

  return (
    <>
      <nav
        className={`sticky top-0 z-50 border-b transition-all duration-300 ${
          scrolled
            ? 'border-white/[0.06] bg-[#050505]/88 shadow-[0_10px_40px_rgba(0,0,0,0.24)] backdrop-blur-2xl'
            : 'border-transparent bg-[#050505]/55 backdrop-blur-xl'
        }`}
      >
        <div className="container mx-auto px-6">
          <div className="flex h-[68px] items-center justify-between gap-6">
            <Link href="/" className="group flex shrink-0 items-center gap-2.5" aria-label="RapidReach home">
              <span className="relative grid h-8 w-8 place-items-center overflow-hidden rounded-[9px] border border-white/[0.1] bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(50,108,229,0.24),transparent_58%)]" />
                <span className="relative text-xs font-semibold tracking-[-0.04em] text-white">RR</span>
              </span>
              <div className="leading-none">
                <span className="block text-[15px] font-semibold tracking-[-0.025em] text-white">RapidReach</span>
                <span className="mt-1 hidden text-[9px] font-medium uppercase tracking-[0.18em] text-zinc-700 xl:block">Engineering knowledge</span>
              </div>
            </Link>

            <div className="hidden items-center gap-1 lg:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3.5 py-2 text-sm transition-colors ${
                    isActive(link.href)
                      ? 'bg-white/[0.055] text-white'
                      : 'text-zinc-500 hover:bg-white/[0.035] hover:text-zinc-200'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => document.dispatchEvent(new CustomEvent('open-command-palette'))}
                className="hidden min-h-9 items-center gap-2 rounded-lg border border-white/[0.065] bg-white/[0.025] px-3 text-xs text-zinc-500 transition-colors hover:border-white/[0.1] hover:bg-white/[0.04] hover:text-zinc-300 md:flex"
                aria-label="Search RapidReach"
              >
                <Search className="h-3.5 w-3.5" />
                <span>Search</span>
                <kbd className="ml-2 rounded border border-white/[0.06] bg-black/20 px-1.5 py-0.5 font-mono text-[9px] text-zinc-700">⌘K</kbd>
              </button>

              {user ? (
                <div className="relative hidden md:block">
                  <button
                    type="button"
                    onClick={() => setShowUserMenu((value) => !value)}
                    className="flex min-h-9 items-center gap-2 rounded-lg border border-white/[0.065] bg-white/[0.025] px-2.5 text-sm text-zinc-300 transition-colors hover:bg-white/[0.045]"
                    aria-expanded={showUserMenu}
                    aria-haspopup="menu"
                  >
                    <span className="grid h-6 w-6 place-items-center rounded-full border border-white/[0.08] bg-white/[0.05] text-[10px] font-semibold text-white">
                      {initial}
                    </span>
                    <span className="max-w-28 truncate">{firstName}</span>
                    <ChevronDown className={`h-3 w-3 text-zinc-600 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {showUserMenu && (
                    <>
                      <button
                        type="button"
                        className="fixed inset-0 z-40 cursor-default"
                        onClick={() => setShowUserMenu(false)}
                        aria-label="Close account menu"
                      />
                      <div className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0b0b0b] p-1.5 shadow-[0_24px_70px_rgba(0,0,0,0.55)]" role="menu">
                        <div className="px-3 py-3">
                          <p className="truncate text-sm font-medium text-white">{displayName}</p>
                          <p className="mt-1 truncate text-xs text-zinc-600">{user.email}</p>
                        </div>
                        <div className="my-1 h-px bg-white/[0.05]" />
                        {user.role === 'admin' && (
                          <Link href="/admin" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-white" role="menuitem">
                            <LayoutDashboard className="h-4 w-4" /> Admin panel
                          </Link>
                        )}
                        <Link href="/profile" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-white" role="menuitem">
                          <UserIcon className="h-4 w-4" /> Profile
                        </Link>
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                          role="menuitem"
                        >
                          <LogOut className="h-4 w-4" /> Sign out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link href="/auth/signup" className="hidden min-h-9 items-center gap-1.5 rounded-lg bg-white px-3.5 text-sm font-medium text-black transition-colors hover:bg-zinc-200 md:flex">
                  Join <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              )}

              <button
                type="button"
                className="grid h-9 w-9 place-items-center rounded-lg border border-white/[0.06] bg-white/[0.025] text-zinc-400 lg:hidden"
                onClick={() => setIsMenuOpen((value) => !value)}
                aria-expanded={isMenuOpen}
                aria-label={isMenuOpen ? 'Close navigation' : 'Open navigation'}
              >
                {isMenuOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} aria-label="Close navigation overlay" />
          <aside className="absolute bottom-0 right-0 top-0 w-[min(88vw,340px)] border-l border-white/[0.07] bg-[#080808] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">RapidReach</span>
              <button type="button" onClick={() => setIsMenuOpen(false)} className="grid h-9 w-9 place-items-center rounded-lg border border-white/[0.06] text-zinc-500" aria-label="Close navigation">
                <X className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                document.dispatchEvent(new CustomEvent('open-command-palette'))
                setIsMenuOpen(false)
              }}
              className="mt-7 flex w-full items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-3 text-sm text-zinc-500"
            >
              <Search className="h-4 w-4" /> Search RapidReach
            </button>

            <div className="mt-7 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block rounded-xl px-3 py-3 text-sm ${isActive(link.href) ? 'bg-white/[0.05] text-white' : 'text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-200'}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="absolute bottom-6 left-6 right-6 border-t border-white/[0.06] pt-5">
              {user ? (
                <div className="space-y-2">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full border border-white/[0.08] bg-white/[0.04] text-xs font-semibold text-white">{initial}</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm text-white">{displayName}</p>
                      <p className="truncate text-xs text-zinc-600">{user.email}</p>
                    </div>
                  </div>
                  <Link href="/profile" className="block rounded-lg border border-white/[0.06] px-3 py-2.5 text-center text-sm text-zinc-300">Profile</Link>
                  <button type="button" onClick={handleLogout} className="w-full rounded-lg px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10">Sign out</button>
                </div>
              ) : (
                <div className="grid gap-2">
                  <Link href="/auth/signup" className="rounded-lg bg-white px-4 py-2.5 text-center text-sm font-medium text-black">Create account</Link>
                  <Link href="/auth/signin" className="rounded-lg border border-white/[0.07] px-4 py-2.5 text-center text-sm text-zinc-400">Sign in</Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
