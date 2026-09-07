'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Boxes,
  Cloud,
  GitBranch,
  Layers3,
  RadioTower,
  ShieldCheck,
  Waypoints,
} from 'lucide-react'

const tracks = [
  {
    id: 'platform',
    role: 'Platform Engineer',
    promise: 'Build the paved road other engineers ship on.',
    href: '/learning-paths',
    icon: Layers3,
    accent: 'Platform systems',
    steps: [
      { label: 'Containers', note: 'Runtime fundamentals', icon: Boxes },
      { label: 'Kubernetes', note: 'Control planes & workloads', icon: Waypoints },
      { label: 'GitOps', note: 'Delivery as a system', icon: GitBranch },
      { label: 'IDP', note: 'Golden paths & portals', icon: Layers3 },
    ],
  },
  {
    id: 'sre',
    role: 'SRE / Reliability',
    promise: 'Understand failure before production teaches you the hard way.',
    href: '/category/observability',
    icon: RadioTower,
    accent: 'Reliability systems',
    steps: [
      { label: 'Linux & network', note: 'What actually fails', icon: Waypoints },
      { label: 'Observability', note: 'Metrics, logs & traces', icon: RadioTower },
      { label: 'SLOs', note: 'Reliability as a contract', icon: ShieldCheck },
      { label: 'Incidents', note: 'Debugging under pressure', icon: GitBranch },
    ],
  },
  {
    id: 'cloud',
    role: 'Cloud Engineer',
    promise: 'Design infrastructure with cost, resilience and operability in mind.',
    href: '/category/cloud',
    icon: Cloud,
    accent: 'Cloud systems',
    steps: [
      { label: 'Cloud primitives', note: 'Compute, network, storage', icon: Cloud },
      { label: 'IaC', note: 'Repeatable infrastructure', icon: GitBranch },
      { label: 'Kubernetes', note: 'Modern workload platforms', icon: Boxes },
      { label: 'Operations', note: 'Cost, security & reliability', icon: ShieldCheck },
    ],
  },
]

export default function RoleNavigator() {
  const [activeId, setActiveId] = useState('platform')
  const active = useMemo(() => tracks.find((track) => track.id === activeId) ?? tracks[0], [activeId])
  const ActiveIcon = active.icon

  return (
    <div className="grid overflow-hidden rounded-[24px] border border-white/[0.07] bg-[#08090b] lg:grid-cols-[0.72fr_1.28fr]">
      <div className="border-b border-white/[0.06] p-4 lg:border-b-0 lg:border-r lg:p-5">
        <p className="px-3 pb-3 pt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-700">Choose your operating mode</p>
        <div className="space-y-1.5">
          {tracks.map((track) => {
            const Icon = track.icon
            const selected = track.id === activeId
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => setActiveId(track.id)}
                className={`group flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3.5 text-left transition ${
                  selected
                    ? 'border-electric-cyan/20 bg-electric-cyan/[0.08]'
                    : 'border-transparent hover:border-white/[0.05] hover:bg-white/[0.025]'
                }`}
              >
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border ${selected ? 'border-electric-cyan/25 bg-electric-cyan/10 text-electric-cyan' : 'border-white/[0.06] bg-white/[0.025] text-zinc-600'}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block text-sm font-medium ${selected ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>{track.role}</span>
                  <span className="mt-0.5 block truncate text-[10px] uppercase tracking-[0.12em] text-zinc-700">{track.accent}</span>
                </span>
                <ArrowRight className={`h-3.5 w-3.5 transition ${selected ? 'translate-x-0 text-electric-cyan' : '-translate-x-1 text-zinc-800 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />
              </button>
            )
          })}
        </div>
      </div>

      <motion.div
        key={active.id}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        className="relative overflow-hidden p-6 md:p-8"
      >
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-electric-cyan/[0.055] blur-[90px]" />
        <div className="relative">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="mb-5 flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.03]">
                  <ActiveIcon className="h-3.5 w-3.5 text-zinc-300" />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-600">ROLE://{active.id}</span>
              </div>
              <h3 className="max-w-2xl text-2xl font-medium tracking-[-0.03em] text-white md:text-3xl">{active.promise}</h3>
            </div>
          </div>

          <div className="relative mt-9 grid gap-3 md:grid-cols-4">
            <div className="absolute left-[10%] right-[10%] top-[21px] hidden h-px bg-gradient-to-r from-transparent via-electric-cyan/30 to-transparent md:block" />
            {active.steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={step.label} className="relative rounded-2xl border border-white/[0.055] bg-black/25 p-4 backdrop-blur-sm">
                  <div className="mb-5 flex items-center justify-between">
                    <span className="relative z-10 grid h-10 w-10 place-items-center rounded-xl border border-white/[0.08] bg-[#0e1013]">
                      <Icon className="h-4 w-4 text-zinc-400" />
                    </span>
                    <span className="font-mono text-[9px] text-zinc-800">0{index + 1}</span>
                  </div>
                  <p className="text-sm font-medium text-zinc-200">{step.label}</p>
                  <p className="mt-1.5 text-[11px] leading-4 text-zinc-600">{step.note}</p>
                </div>
              )
            })}
          </div>

          <div className="mt-7 flex flex-col gap-4 border-t border-white/[0.05] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-xs leading-5 text-zinc-600">Stop collecting disconnected tutorials. Build the mental model in the order the systems depend on each other.</p>
            <Link href={active.href} className="group inline-flex shrink-0 items-center gap-2 text-sm font-medium text-zinc-300 transition hover:text-white">
              Enter this track
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
