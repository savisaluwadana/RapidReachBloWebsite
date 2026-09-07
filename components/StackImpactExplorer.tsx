'use client'

import { useMemo, useState } from 'react'
import { Boxes, ShieldAlert } from 'lucide-react'
import type { IntelligenceViewSignal, StackView } from '@/lib/rapidreach/read-model'

export default function StackImpactExplorer({ technologies, signals }: { technologies: StackView[]; signals: IntelligenceViewSignal[] }) {
  const [selected, setSelected] = useState<string[]>(technologies.slice(0, 4).map((item) => item.id))
  const active = useMemo(() => technologies.filter((item) => selected.includes(item.id)), [selected, technologies])
  const matchingSignals = useMemo(() => signals.filter((signal) => signal.affected.some((affected) => active.some((tech) => affected.toLowerCase().includes(tech.name.toLowerCase()) || tech.name.toLowerCase().includes(affected.toLowerCase())))), [active, signals])
  const isLive = technologies.some((item) => item.live)

  const toggle = (id: string) => setSelected((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id])

  return (
    <div className="grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
      <section className="rounded-2xl border border-white/[0.06] bg-[#090909] p-6">
        <div className="flex items-center gap-2"><Boxes className="h-4 w-4 text-electric-cyan" /><p className="text-sm font-medium text-white">Connected stack</p></div>
        <p className="mt-2 text-xs leading-5 text-zinc-600">{isLive ? 'Persisted organization inventory. Select components to inspect their current intelligence surface.' : 'Demo inventory. Create an organization and connect a stack to enable live impact matching.'}</p>
        <div className="mt-5 grid grid-cols-2 gap-2">{technologies.map((tech) => <button key={tech.id} onClick={() => toggle(tech.id)} className={`rounded-xl border p-3 text-left ${selected.includes(tech.id) ? 'border-electric-cyan/30 bg-electric-cyan/[0.06]' : 'border-white/[0.05] bg-black/20'}`}><p className="text-sm text-zinc-300">{tech.name}</p><p className="mt-1 text-[10px] text-zinc-700">{tech.layer}</p></button>)}</div>
      </section>
      <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
        <div className="flex items-center justify-between"><div><p className="text-sm font-medium text-white">Impact surface</p><p className="mt-1 text-xs text-zinc-600">{active.length} connected technologies · {matchingSignals.length} matching {isLive ? 'live' : 'demo'} signals</p></div><ShieldAlert className="h-4 w-4 text-amber-300" /></div>
        <div className="mt-5 space-y-3">{active.map((tech) => <div key={tech.id} className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-black/20 p-4"><div><p className="text-sm text-zinc-300">{tech.name}</p><p className="mt-1 text-[10px] text-zinc-700">{tech.layer}</p></div><span className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-wider ${tech.exposure === 'high' ? 'bg-red-500/10 text-red-400' : tech.exposure === 'medium' ? 'bg-amber-500/10 text-amber-300' : 'bg-emerald-500/10 text-emerald-300'}`}>{tech.exposure}</span></div>)}</div>
        <div className="mt-6 border-t border-white/[0.05] pt-5">
          <p className="text-xs font-medium text-zinc-300">Matched intelligence</p>
          <div className="mt-3 space-y-2">{matchingSignals.slice(0, 5).map((signal) => <div key={signal.id} className="rounded-xl border border-white/[0.05] bg-black/20 p-4"><div className="flex items-center justify-between gap-3"><p className="text-sm text-zinc-300">{signal.title}</p><span className="text-[10px] uppercase text-zinc-600">{signal.impact}</span></div><p className="mt-2 text-xs leading-5 text-zinc-600">{signal.action}</p></div>)}</div>
          {!matchingSignals.length && <p className="mt-3 text-xs leading-5 text-zinc-600">No current signals intersect with the selected stack components.</p>}
        </div>
      </section>
    </div>
  )
}
