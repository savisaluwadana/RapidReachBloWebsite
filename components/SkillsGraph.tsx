'use client'

import { useMemo, useState } from 'react'
import { ArrowRight, Target } from 'lucide-react'
import type { SkillView } from '@/lib/rapidreach/read-model'

export default function SkillsGraph({ skills }: { skills: SkillView[] }) {
  const [selected, setSelected] = useState(skills[0]?.id ?? '')
  const active = skills.find((skill) => skill.id === selected) ?? skills[0]
  const next = useMemo(() => [...skills].filter((skill) => skill.score < skill.target).sort((a, b) => (b.target - b.score) - (a.target - a.score)).slice(0, 3), [skills])
  const isLive = skills.some((skill) => skill.live)

  if (!active) return <div className="rounded-2xl border border-dashed border-white/[0.08] p-10 text-center text-sm text-zinc-600">No skill assessments yet.</div>

  return (
    <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
      <div className="rounded-2xl border border-white/[0.06] bg-[#090909] p-5 md:p-7">
        <div className="mb-7 flex items-center justify-between">
          <div><p className="text-sm font-medium text-white">Personal engineering map</p><p className="mt-1 text-xs text-zinc-600">{isLive ? 'Persisted profile · assessments can be updated by labs and evaluations' : 'Demo profile · complete assessments to create your persisted graph'}</p></div>
          <Target className="h-4 w-4 text-electric-cyan" />
        </div>
        <div className="space-y-3">
          {skills.map((skill) => {
            const gap = skill.target - skill.score
            return (
              <button key={skill.id} onClick={() => setSelected(skill.id)} className={`w-full rounded-xl border p-4 text-left transition-colors ${selected === skill.id ? 'border-electric-cyan/30 bg-electric-cyan/[0.06]' : 'border-white/[0.05] bg-white/[0.015] hover:border-white/[0.09]'}`}>
                <div className="mb-3 flex items-center justify-between gap-4"><div><p className="text-sm font-medium text-zinc-200">{skill.name}</p><p className="mt-1 text-[11px] text-zinc-700">{skill.domain}{skill.dependency ? ` · depends on ${skills.find((item) => item.id === skill.dependency)?.name ?? skill.dependency}` : ''}</p></div><span className="text-sm font-semibold tabular-nums text-white">{skill.score}%</span></div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.04]"><div className="h-full rounded-full bg-gradient-to-r from-electric-cyan to-cyber-lime" style={{ width: `${skill.score}%` }} /></div>
                <p className="mt-2 text-[10px] text-zinc-700">Target {skill.target}% · {gap > 0 ? `${gap}% gap` : 'target reached'}</p>
              </button>
            )
          })}
        </div>
      </div>

      <aside className="space-y-5">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-700">Selected competency</p>
          <h2 className="mt-4 text-2xl font-medium tracking-tight text-white">{active.name}</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-500">RapidReach uses prerequisites, role targets, labs, incident performance, and explicit assessments to decide what you should learn next—not just course completion.</p>
          <div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-xl border border-white/[0.05] bg-black/20 p-4"><p className="text-2xl font-semibold text-white">{active.score}%</p><p className="mt-1 text-[11px] text-zinc-700">Current</p></div><div className="rounded-xl border border-white/[0.05] bg-black/20 p-4"><p className="text-2xl font-semibold text-white">{active.target}%</p><p className="mt-1 text-[11px] text-zinc-700">Role target</p></div></div>
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-[#090909] p-6">
          <p className="text-sm font-medium text-white">Highest-value next moves</p>
          <div className="mt-4 space-y-2">{next.map((skill) => <div key={skill.id} className="flex items-center justify-between rounded-xl border border-white/[0.05] px-4 py-3"><div><p className="text-sm text-zinc-300">{skill.name}</p><p className="text-[10px] text-zinc-700">Gap {skill.target - skill.score}%</p></div><ArrowRight className="h-3.5 w-3.5 text-zinc-700" /></div>)}</div>
        </div>
      </aside>
    </div>
  )
}
