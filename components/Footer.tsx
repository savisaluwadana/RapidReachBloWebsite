'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

const sections = [
  {
    title: 'Product',
    links: [
      { label: 'Intelligence', href: '/intelligence' },
      { label: 'Knowledge Graph', href: '/graph' },
      { label: 'Skills Graph', href: '/skills' },
      { label: 'Labs', href: '/labs' },
      { label: 'Stack Graph', href: '/stack' },
      { label: 'Agent Evaluations', href: '/evaluations' },
      { label: 'MCP', href: '/mcp' },
      { label: 'Teams', href: '/teams' },
    ],
  },
  {
    title: 'Learn',
    links: [
      { label: 'Articles', href: '/blog' },
      { label: 'Learning paths', href: '/learning-paths' },
      { label: 'News', href: '/news' },
    ],
  },
  {
    title: 'Domains',
    links: [
      { label: 'Kubernetes', href: '/category/kubernetes' },
      { label: 'Platform Engineering', href: '/category/platform-engineering' },
      { label: 'GitOps & CI/CD', href: '/category/cicd' },
      { label: 'Observability', href: '/category/observability' },
    ],
  },
  {
    title: 'RapidReach',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Join', href: '/auth/signup' },
      { label: 'Subscribe', href: '/subscribe' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.05] bg-[#040404]">
      <div className="container mx-auto px-6 py-14 md:py-16">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_2fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-[9px] border border-white/[0.09] bg-white/[0.035] text-[11px] font-semibold text-white">RR</span>
              <span className="text-sm font-semibold tracking-[-0.02em] text-white">RapidReach</span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-6 text-zinc-600">
              Engineering intelligence for humans and agents building and operating modern cloud-native systems.
            </p>
            <button
              type="button"
              onClick={() => document.dispatchEvent(new CustomEvent('open-command-palette'))}
              className="mt-6 inline-flex items-center gap-2 text-xs text-zinc-700 transition-colors hover:text-zinc-400"
            >
              Search with <kbd className="rounded border border-white/[0.06] bg-white/[0.025] px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {sections.map((section) => (
              <div key={section.title}>
                <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-700">{section.title}</h3>
                <ul className="mt-4 space-y-3">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-sm text-zinc-500 transition-colors hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-12 flex max-w-6xl flex-col gap-4 border-t border-white/[0.05] pt-6 text-xs text-zinc-700 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} RapidReach. Built for engineers.</p>
          <Link href="/mcp" className="inline-flex items-center gap-1.5 transition-colors hover:text-zinc-400">
            Engineering intelligence for agents <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </footer>
  )
}
