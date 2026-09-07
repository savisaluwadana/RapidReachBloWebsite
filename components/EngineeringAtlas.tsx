'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  Activity,
  ArrowUpRight,
  Boxes,
  Cloud,
  GitBranch,
  Layers3,
  LockKeyhole,
  Radar,
} from 'lucide-react'

const nodes = [
  {
    id: 'runtime',
    label: 'Runtime',
    description: 'Containers, Kubernetes, scheduling and workload behaviour.',
    href: '/category/kubernetes',
    icon: Boxes,
    x: '20%',
    y: '24%',
  },
  {
    id: 'delivery',
    label: 'Delivery',
    description: 'CI/CD, GitOps, releases and progressive delivery.',
    href: '/category/cicd',
    icon: GitBranch,
    x: '78%',
    y: '22%',
  },
  {
    id: 'platform',
    label: 'Platform',
    description: 'Internal platforms, paved roads and developer experience.',
    href: '/category/platform-engineering',
    icon: Layers3,
    x: '50%',
    y: '48%',
  },
  {
    id: 'cloud',
    label: 'Cloud',
    description: 'Infrastructure, architecture, cost and operational trade-offs.',
    href: '/category/cloud',
    icon: Cloud,
    x: '18%',
    y: '78%',
  },
  {
    id: 'reliability',
    label: 'Reliability',
    description: 'Observability, incidents, SLOs and production debugging.',
    href: '/category/observability',
    icon: Activity,
    x: '80%',
    y: '76%',
  },
  {
    id: 'security',
    label: 'Security',
    description: 'Workload policy, secrets and software supply-chain security.',
    href: '/category/security',
    icon: LockKeyhole,
    x: '50%',
    y: '88%',
  },
]

export default function EngineeringAtlas({ totalPosts, totalUsers }: { totalPosts: number; totalUsers: number }) {
  const [activeId, setActiveId] = useState('platform')
  const reducedMotion = useReducedMotion()
  const active = useMemo(() => nodes.find((node) => node.id === activeId) ?? nodes[2], [activeId])
  const ActiveIcon = active.icon

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#08090b]/90 shadow-[0_40px_120px_rgba(0,0,0,0.48)]">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyber-lime opacity-50" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyber-lime" />
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Engineering atlas</span>
        </div>
        <span className="rounded-md border border-white/[0.06] bg-white/[0.025] px-2 py-1 font-mono text-[9px] text-zinc-600">LIVE MAP / 06 DOMAINS</span>
      </div>

      <div className="relative h-[370px] overflow-hidden md:h-[430px]">
        <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:36px_36px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(50,108,229,0.12),transparent_38%)]" />

        <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
          <defs>
            <linearGradient id="atlasLine" x1="0" x2="1">
              <stop offset="0%" stopColor="rgba(50,108,229,0.08)" />
              <stop offset="50%" stopColor="rgba(114,156,255,0.55)" />
              <stop offset="100%" stopColor="rgba(0,255,136,0.12)" />
            </linearGradient>
          </defs>
          {[
            ['20%', '24%', '50%', '48%'],
            ['78%', '22%', '50%', '48%'],
            ['18%', '78%', '50%', '48%'],
            ['80%', '76%', '50%', '48%'],
            ['50%', '88%', '50%', '48%'],
          ].map(([x1, y1, x2, y2], index) => (
            <motion.line
              key={index}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="url(#atlasLine)"
              strokeWidth="1"
              strokeDasharray="5 8"
              initial={reducedMotion ? false : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.1, delay: index * 0.08 }}
            />
          ))}
        </svg>

        {nodes.map((node) => {
          const Icon = node.icon
          const isActive = activeId === node.id
          return (
            <button
              key={node.id}
              type="button"
              onMouseEnter={() => setActiveId(node.id)}
              onFocus={() => setActiveId(node.id)}
              onClick={() => setActiveId(node.id)}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 text-left"
              style={{ left: node.x, top: node.y }}
              aria-label={`Explore ${node.label}`}
            >
              <motion.span
                className={`relative grid h-12 w-12 place-items-center rounded-2xl border backdrop-blur-xl transition-colors md:h-14 md:w-14 ${
                  isActive
                    ? 'border-electric-cyan/45 bg-electric-cyan/15 text-white shadow-[0_0_45px_rgba(50,108,229,0.28)]'
                    : 'border-white/[0.08] bg-[#0c0d10]/90 text-zinc-500 hover:border-white/[0.16] hover:text-zinc-200'
                }`}
                animate={reducedMotion || !isActive ? undefined : { scale: [1, 1.045, 1] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
              >
                {isActive && <span className="absolute inset-[-8px] rounded-[20px] border border-electric-cyan/10" />}
                <Icon className="h-4 w-4 md:h-[18px] md:w-[18px]" />
              </motion.span>
              <span className={`mt-2 block -translate-x-1/4 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.14em] ${isActive ? 'text-zinc-300' : 'text-zinc-700'}`}>
                {node.label}
              </span>
            </button>
          )
        })}

        <div className="absolute bottom-4 left-4 right-4 z-20 rounded-2xl border border-white/[0.07] bg-black/60 p-4 backdrop-blur-2xl md:bottom-5 md:left-5 md:right-5">
          <div className="flex items-start justify-between gap-5">
            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg border border-electric-cyan/20 bg-electric-cyan/10">
                  <ActiveIcon className="h-3.5 w-3.5 text-electric-cyan" />
                </span>
                <p className="text-sm font-medium text-white">{active.label}</p>
              </div>
              <p className="max-w-[330px] text-xs leading-5 text-zinc-500">{active.description}</p>
            </div>
            <Link href={active.href} className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-zinc-500 transition hover:border-electric-cyan/30 hover:text-white" aria-label={`Open ${active.label}`}>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-px border-t border-white/[0.06] bg-white/[0.05]">
        <div className="bg-[#090a0c] px-4 py-3.5">
          <p className="font-mono text-lg font-medium text-zinc-200">{totalPosts}</p>
          <p className="mt-0.5 text-[9px] uppercase tracking-[0.15em] text-zinc-700">Signals</p>
        </div>
        <div className="bg-[#090a0c] px-4 py-3.5">
          <p className="font-mono text-lg font-medium text-zinc-200">{totalUsers}</p>
          <p className="mt-0.5 text-[9px] uppercase tracking-[0.15em] text-zinc-700">Readers</p>
        </div>
        <div className="bg-[#090a0c] px-4 py-3.5">
          <div className="flex items-center gap-1.5">
            <Radar className="h-3.5 w-3.5 text-cyber-lime" />
            <p className="font-mono text-lg font-medium text-zinc-200">24/7</p>
          </div>
          <p className="mt-0.5 text-[9px] uppercase tracking-[0.15em] text-zinc-700">Learning</p>
        </div>
      </div>
    </div>
  )
}
