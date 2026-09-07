'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowUpRight, ChevronDown, LayoutDashboard, LogOut, Menu, Search, User as UserIcon, X } from 'lucide-react'
import { getCurrentUser, signOut } from '@/lib/actions/auth'
import type { UserProfile } from '@/lib/types/database'

const productLinks = [
  { label: 'Intelligence', href: '/intelligence' },
  { label: 'Skills', href: '/skills' },
  { label: 'Labs', href: '/labs' },
  { label: 'Stack', href: '/stack' },
  { label: 'MCP', href: '/mcp' },
]

const secondaryLinks = [
  { label: 'Learning paths', href: '/learning-paths' },
  { label: 'Articles', href: '/blog' },
  { label: 'Teams', href: '/teams' },
  { label: 'About', href: '/about' },
]

function displayName(user: UserProfile) {
  return user.full_name?.trim() || user.email?.split('@')[0] || 'Account'
}

export default function Navbar() {
  const pathname = usePathname()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    let active = true
    const restore = async () => {
      try {
        const cached = sessionStorage.getItem('rr_user_cache')
        if (cached) {
          const parsed = JSON.parse(cached) as { data?: UserProfile | null; ts?: number }
          if (parsed.ts && Date.now() - parsed.ts < 5 * 60 * 1000) {
            if (active) setUser(parsed.data ?? null)
            return
          }
        }
        const current = await getCurrentUser()
        if (!active) return
        setUser(current)
        sessionStorage.setItem('rr_user_cache', JSON.stringify({ data: current, ts: Date.now() }))
      } catch (error) {
        console.error('Unable to restore RapidReach session:', error)
        if (active) setUser(null)
      }
    }
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    void restore()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { active = false; window.removeEventListener('scroll', onScroll) }
  }, [])

  useEffect(() => { setMobileOpen(false); setAccountOpen(false) }, [pathname])

  const active = (href: string) => pathname === href || pathname.startsWith(`${href}/`)
  const name = user ? displayName(user) : ''
  const initial = name.charAt(0).toUpperCase() || 'R'

  const logout = async () => {
    try { await signOut() } finally {
      setUser(null)
      try { sessionStorage.removeItem('rr_user_cache') } catch {}
      window.location.assign('/')
    }
  }

  return (
    <>
      <nav className={`sticky top-0 z-50 border-b transition-all ${scrolled ? 'border-white/[0.06] bg-[#050505]/90 shadow-[0_12px_45px_rgba(0,0,0,.3)] backdrop-blur-2xl' : 'border-transparent bg-[#050505]/65 backdrop-blur-xl'}`}>
        <div className="container mx-auto px-6">
          <div className="flex h-[68px] items-center gap-5">
            <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="RapidReach home">
              <span className="relative grid h-8 w-8 place-items-center overflow-hidden rounded-[9px] border border-white/[0.1] bg-white/[0.04]"><span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(50,108,229,.28),transparent_58%)]" /><span className="relative text-[11px] font-semibold text-white">RR</span></span>
              <div className="leading-none"><span className="block text-[15px] font-semibold tracking-[-0.025em] text-white">RapidReach</span><span className="mt-1 hidden text-[9px] font-medium uppercase tracking-[0.18em] text-zinc-700 2xl:block">Engineering Intelligence OS</span></div>
            </Link>

            <div className="hidden flex-1 items-center justify-center gap-1 lg:flex">
              {productLinks.map((link) => <Link key={link.href} href={link.href} className={`rounded-lg px-3 py-2 text-sm transition-colors ${active(link.href) ? 'bg-white/[0.06] text-white' : 'text-zinc-500 hover:bg-white/[0.035] hover:text-zinc-200'}`}>{link.label}</Link>)}
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Link href="/learning-paths" className="hidden text-xs text-zinc-600 transition-colors hover:text-white xl:block">Learn</Link>
              <button type="button" onClick={() => document.dispatchEvent(new CustomEvent('open-command-palette'))} className="hidden h-9 items-center gap-2 rounded-lg border border-white/[0.065] bg-white/[0.025] px-3 text-xs text-zinc-500 hover:text-white md:flex" aria-label="Search RapidReach"><Search className="h-3.5 w-3.5" /><span className="hidden xl:inline">Search</span><kbd className="hidden rounded border border-white/[0.06] px-1.5 py-0.5 font-mono text-[9px] text-zinc-700 xl:inline">⌘K</kbd></button>

              {user ? (
                <div className="relative hidden md:block">
                  <button type="button" onClick={() => setAccountOpen((v) => !v)} className="flex h-9 items-center gap-2 rounded-lg border border-white/[0.065] bg-white/[0.025] px-2.5 text-sm text-zinc-300" aria-expanded={accountOpen} aria-haspopup="menu"><span className="grid h-6 w-6 place-items-center rounded-full bg-white/[0.06] text-[10px] font-semibold text-white">{initial}</span><ChevronDown className={`h-3 w-3 text-zinc-600 ${accountOpen ? 'rotate-180' : ''}`} /></button>
                  {accountOpen && <><button type="button" className="fixed inset-0 z-40 cursor-default" onClick={() => setAccountOpen(false)} aria-label="Close account menu" /><div className="absolute right-0 z-50 mt-2 w-60 rounded-xl border border-white/[0.08] bg-[#0b0b0b] p-1.5 shadow-2xl" role="menu"><div className="px-3 py-3"><p className="truncate text-sm font-medium text-white">{name}</p><p className="mt-1 truncate text-xs text-zinc-600">{user.email}</p></div><div className="h-px bg-white/[0.05]" />{user.role === 'admin' && <Link href="/admin" className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-white/[0.04] hover:text-white"><LayoutDashboard className="h-4 w-4" /> Admin</Link>}<Link href="/profile" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-white/[0.04] hover:text-white"><UserIcon className="h-4 w-4" /> Profile</Link><button type="button" onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-500 hover:bg-red-500/10 hover:text-red-400"><LogOut className="h-4 w-4" /> Sign out</button></div></>}
                </div>
              ) : <Link href="/auth/signup" className="hidden h-9 items-center gap-1.5 rounded-lg bg-white px-3.5 text-sm font-medium text-black hover:bg-zinc-200 md:flex">Join <ArrowUpRight className="h-3.5 w-3.5" /></Link>}

              <button type="button" onClick={() => setMobileOpen((v) => !v)} className="grid h-9 w-9 place-items-center rounded-lg border border-white/[0.06] bg-white/[0.025] text-zinc-400 lg:hidden" aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}>{mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</button>
            </div>
          </div>
        </div>
      </nav>

      {mobileOpen && <div className="fixed inset-0 z-40 lg:hidden"><button type="button" className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setMobileOpen(false)} aria-label="Close navigation overlay" /><aside className="absolute bottom-0 right-0 top-0 w-[min(90vw,360px)] overflow-y-auto border-l border-white/[0.07] bg-[#080808] p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-white">RapidReach</p><p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-zinc-700">Engineering Intelligence OS</p></div><button type="button" onClick={() => setMobileOpen(false)} className="grid h-9 w-9 place-items-center rounded-lg border border-white/[0.06] text-zinc-500"><X className="h-4 w-4" /></button></div><button type="button" onClick={() => { document.dispatchEvent(new CustomEvent('open-command-palette')); setMobileOpen(false) }} className="mt-7 flex w-full items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-3 text-sm text-zinc-500"><Search className="h-4 w-4" /> Search RapidReach</button><p className="mt-7 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-700">Product</p><div className="mt-2 space-y-1">{productLinks.map((link) => <Link key={link.href} href={link.href} className={`block rounded-xl px-3 py-3 text-sm ${active(link.href) ? 'bg-white/[0.05] text-white' : 'text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-200'}`}>{link.label}</Link>)}</div><p className="mt-7 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-700">Explore</p><div className="mt-2 space-y-1">{secondaryLinks.map((link) => <Link key={link.href} href={link.href} className="block rounded-xl px-3 py-3 text-sm text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-200">{link.label}</Link>)}</div><div className="mt-8 border-t border-white/[0.06] pt-5">{user ? <div className="space-y-2"><p className="px-3 text-sm text-white">{name}</p><Link href="/profile" className="block rounded-lg border border-white/[0.06] px-3 py-2.5 text-center text-sm text-zinc-300">Profile</Link><button type="button" onClick={logout} className="w-full rounded-lg px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10">Sign out</button></div> : <div className="grid gap-2"><Link href="/auth/signup" className="rounded-lg bg-white px-4 py-2.5 text-center text-sm font-medium text-black">Create account</Link><Link href="/auth/signin" className="rounded-lg border border-white/[0.07] px-4 py-2.5 text-center text-sm text-zinc-400">Sign in</Link></div>}</div></aside></div>}
    </>
  )
}
