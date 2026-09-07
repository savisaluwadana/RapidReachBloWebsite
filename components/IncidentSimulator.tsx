'use client'

import { useState } from 'react'
import { Activity, CheckCircle2, ChevronRight, TerminalSquare } from 'lucide-react'
import { incidents } from '@/lib/rapidreach/product-data'

const tabs = ['metrics', 'traces', 'events', 'logs'] as const

export default function IncidentSimulator() {
  const incident = incidents[0]
  const [tab, setTab] = useState<(typeof tabs)[number]>('metrics')
  const [choice, setChoice] = useState<string | null>(null)
  const selected = incident.choices.find((item) => item.id === choice)

  return (
    <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
      <section className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#080808]">
        <div className="flex flex-col gap-4 border-b border-white/[0.05] p-6 sm:flex-row sm:items-center sm:justify-between">
          <div><div className="flex items-center gap-2"><span className="rounded-md bg-red-500/10 px-2 py-1 text-[10px] font-bold tracking-[0.14em] text-red-400">{incident.severity}</span><span className="text-xs text-zinc-700">{incident.service}</span></div><h2 className="mt-3 text-xl font-medium text-white">{incident.title}</h2></div>
          <Activity className="h-5 w-5 text-red-400" />
        </div>
        <div className="grid gap-px bg-white/[0.05] sm:grid-cols-2">{incident.symptoms.map((symptom) => <div key={symptom} className="bg-[#090909] p-4 text-xs text-zinc-400">{symptom}</div>)}</div>
        <div className="p-6">
          <div className="flex gap-1 overflow-x-auto no-scrollbar">{tabs.map((item) => <button key={item} onClick={() => setTab(item)} className={`rounded-lg px-3 py-2 text-xs capitalize ${tab === item ? 'bg-white text-black' : 'text-zinc-600 hover:bg-white/[0.04] hover:text-white'}`}>{item}</button>)}</div>
          <div className="mt-4 rounded-xl border border-white/[0.05] bg-black/30 p-4 font-mono text-xs leading-6 text-zinc-400">{incident.evidence[tab].map((line) => <div key={line} className="flex gap-3"><span className="select-none text-zinc-800">›</span><span>{line}</span></div>)}</div>
        </div>
      </section>

      <aside className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
        <div className="flex items-center gap-2"><TerminalSquare className="h-4 w-4 text-electric-cyan" /><p className="text-sm font-medium text-white">Choose your next action</p></div>
        <p className="mt-2 text-xs leading-5 text-zinc-600">The evaluator rewards evidence-driven diagnosis and penalizes risky actions that do not match the observed system state.</p>
        <div className="mt-5 space-y-2">{incident.choices.map((item) => <button key={item.id} onClick={() => setChoice(item.id)} className={`flex w-full items-center justify-between gap-4 rounded-xl border p-4 text-left transition-colors ${choice === item.id ? 'border-electric-cyan/30 bg-electric-cyan/[0.06]' : 'border-white/[0.05] bg-black/20 hover:border-white/[0.1]'}`}><span className="text-sm text-zinc-300">{item.label}</span><ChevronRight className="h-4 w-4 shrink-0 text-zinc-700" /></button>)}</div>

        {selected && <div className="mt-5 rounded-xl border border-white/[0.06] bg-black/25 p-5"><div className="flex items-center gap-2"><CheckCircle2 className={`h-4 w-4 ${selected.score === 3 ? 'text-cyber-lime' : 'text-amber-300'}`} /><p className="text-sm font-medium text-white">Reasoning feedback</p></div><p className="mt-3 text-sm leading-6 text-zinc-500">{selected.feedback}</p>{selected.score === 3 && <div className="mt-5 border-t border-white/[0.05] pt-4"><p className="text-xs font-medium text-zinc-300">Root cause</p><p className="mt-2 text-xs leading-5 text-zinc-600">{incident.rootCause}</p><p className="mt-4 text-xs font-medium text-zinc-300">Safe remediation</p><p className="mt-2 text-xs leading-5 text-zinc-600">{incident.remediation}</p></div>}</div>}
      </aside>
    </div>
  )
}
