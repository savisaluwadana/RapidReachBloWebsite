'use client'

import { useMemo, useState } from 'react'
import { Boxes, ShieldAlert } from 'lucide-react'
import { intelligenceSignals, stackTechnologies } from '@/lib/rapidreach/product-data'

export default function StackImpactExplorer() {
  const [selected, setSelected] = useState<string[]>(['eks','argocd','cilium','prometheus'])
  const active = useMemo(() => stackTechnologies.filter((item) => selected.includes(item.id)), [selected])
  const matchingSignals = useMemo(() => intelligenceSignals.filter((signal) => signal.affected.some((affected) => active.some((tech) => affected.toLowerCase().includes(tech.name.toLowerCase()) || tech.name.toLowerCase().includes(affected.toLowerCase())))), [active])

  const toggle = (id: string) => setSelected((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id])

  return (
    <div className="grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
      <section className="rounded-2xl border border-white/[0.06] bg-[#090909] p-6">
        <div className="flex items-center gap-2"><Boxes className="h-4 w-4 text-electric-cyan" /><p className="text-sm font-medium text-white">Connected stack</p></div>
        <p className="mt-2 text-xs leading-5 text-zinc-600">Select technologies to preview how RapidReach converts ecosystem changes into environment-specific impact.</p>
        <div className="mt-5 grid grid-cols-2 gap-2">{stackTechnologies.map((tech) => <button key={tech.id} onClick={() => toggle(tech.id)} className={`rounded-xl border p-3 text-left ${selected.includes(tech.id) ? 'border-electric-cyan/30 bg-electric-cyan/[0.06]' : 'border-white/[0.05] bg-black/20'}`}><p className="text-sm text-zinc-300">{tech.name}</p><p className="mt-1 text-[10px] text-zinc-700">{tech.layer}</p></button>)}</div>
      </section>
      <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
        <div className="flex items-center justify-between"><div><p className="text-sm font-medium text-white">Impact surface</p><p className="mt-1 text-xs text-zinc-600">{active.length} connected technologies · {matchingSignals.length} matching preview signals</p></div><ShieldAlert className="h-4 w-4 text-amber-300" /></div>
        <div className="mt-5 space-y-3">{active.map((tech) => <div key={tech.id} className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-black/20 p-4"><div><p className="text-sm text-zinc-300">{tech.name}</p><p className="mt-1 text-[10px] text-zinc-700">{tech.layer}</p></div><span className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-wider ${tech.exposure === 'high' ? 'bg-red-500/10 text-red-400' : tech.exposure === 'medium' ? 'bg-amber-500/10 text-amber-300' : 'bg-emerald-500/10 text-emerald-300'}`}>{tech.exposure}</span></div>)}</div>
        <div className="mt-6 border-t border-white/[0.05] pt-5"><p className="text-xs font-medium text-zinc-300">Why this matters</p><p className="mt-2 text-xs leading-5 text-zinc-600">The long-term product connects real inventory, ownership, release feeds, vulnerabilities, and engineer competency. A signal becomes valuable only when RapidReach can explain whether your environment is affected and who needs to act.</p></div>
      </section>
    </div>
  )
}
