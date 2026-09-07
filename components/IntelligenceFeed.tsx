'use client'

import { useMemo, useState } from 'react'
import { AlertTriangle, ArrowUpRight, Filter, Radar } from 'lucide-react'
import type { IntelligenceViewSignal } from '@/lib/rapidreach/read-model'

const impactOrder = { critical: 4, high: 3, medium: 2, low: 1 }

export default function IntelligenceFeed({ signals }: { signals: IntelligenceViewSignal[] }) {
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all')
  const visibleSignals = useMemo(() => [...signals]
    .filter((signal) => filter === 'all' || signal.impact === filter)
    .sort((a, b) => impactOrder[b.impact] - impactOrder[a.impact), [filter, signals])

  const isLive = signals.some((signal) => signal.live)

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.035]"><Radar className="h-4 w-4 text-electric-cyan" /></span>
          <div>
            <p className="text-sm font-medium text-white">Engineering intelligence</p>
            <p className="text-xs text-zinc-600">{isLive ? 'Live upstream adapters · organization-aware impact model' : 'Demo mode · connect Supabase and run ingestion for live signals'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <Filter className="h-3.5 w-3.5 shrink-0 text-zinc-700" />
          {(['all','critical','high','medium','low'] as const).map((item) => (
            <button key={item} onClick={() => setFilter(item)} className={`rounded-lg px-3 py-1.5 text-xs capitalize transition-colors ${filter === item ? 'bg-white text-black' : 'border border-white/[0.06] bg-white/[0.025] text-zinc-500 hover:text-white'}`}>{item}</button>
          ))}
        </div>
      </div>

      {visibleSignals.map((signal) => (
        <article key={signal.id} className="group rounded-2xl border border-white/[0.06] bg-[#090909] p-6 transition-colors hover:border-white/[0.11]">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${signal.impact === 'critical' ? 'bg-red-500/15 text-red-300' : signal.impact === 'high' ? 'bg-red-500/10 text-red-400' : signal.impact === 'medium' ? 'bg-amber-500/10 text-amber-300' : 'bg-emerald-500/10 text-emerald-300'}`}>{signal.impact} impact</span>
                <span className="text-[11px] text-zinc-700">{signal.domain}</span>
                <span className="text-[11px] text-zinc-800">•</span>
                <span className="text-[11px] text-zinc-700">{signal.source}</span>
                {signal.publishedAt && <span className="text-[11px] text-zinc-800">{new Date(signal.publishedAt).toLocaleDateString()}</span>}
              </div>
              <h2 className="mt-4 text-xl font-medium tracking-tight text-white">{signal.title}</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-500">{signal.summary}</p>
              <div className="mt-5 flex flex-wrap gap-2">{signal.affected.map((item) => <span key={item} className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-2.5 py-1 text-xs text-zinc-500">{item}</span>)}</div>
            </div>
            <AlertTriangle className="h-5 w-5 shrink-0 text-zinc-700" />
          </div>
          <div className="mt-6 flex flex-col gap-3 border-t border-white/[0.05] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-zinc-500"><span className="font-medium text-zinc-300">Recommended action:</span> {signal.action}</p>
            {signal.sourceUrl ? <a href={signal.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-zinc-500 transition-colors hover:text-white">Source <ArrowUpRight className="h-3 w-3" /></a> : <span className="inline-flex items-center gap-1 text-xs text-zinc-700">{signal.live ? 'Live signal' : 'Demo signal'} <ArrowUpRight className="h-3 w-3" /></span>}
          </div>
        </article>
      ))}

      {!visibleSignals.length && <div className="rounded-2xl border border-dashed border-white/[0.08] p-10 text-center text-sm text-zinc-600">No intelligence signals match this filter.</div>}
    </div>
  )
}
