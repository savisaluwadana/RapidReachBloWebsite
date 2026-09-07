'use client'

import { useMemo, useState } from 'react'
import { ArrowUpRight, Network, Search } from 'lucide-react'
import type { KnowledgeGraphEdge, KnowledgeGraphNode } from '@/lib/rapidreach/knowledge/view'

export default function KnowledgeGraphExplorer({ nodes, edges, live }: { nodes: KnowledgeGraphNode[]; edges: KnowledgeGraphEdge[]; live: boolean }) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(nodes[0]?.id ?? '')
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return nodes
    return nodes.filter((node) => `${node.title} ${node.domain} ${node.technology ?? ''} ${node.tags.join(' ')}`.toLowerCase().includes(needle))
  }, [nodes, query])
  const active = nodes.find((node) => node.id === selected) ?? filtered[0]
  const connected = useMemo(() => {
    if (!active) return []
    const ids = new Set<string>()
    for (const edge of edges) {
      if (edge.from === active.id) ids.add(edge.to)
      if (edge.to === active.id) ids.add(edge.from)
    }
    return nodes.filter((node) => ids.has(node.id)).slice(0, 8)
  }, [active, edges, nodes])

  if (!nodes.length) {
    return <div className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.015] p-10 text-center"><Network className="mx-auto h-5 w-5 text-zinc-700" /><p className="mt-4 text-sm text-zinc-500">The persistent graph is ready, but it has not been indexed yet.</p><p className="mt-2 text-xs text-zinc-700">Run the background worker after applying the v1 migrations to index published articles, stack components, and intelligence signals.</p></div>
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
      <section className="rounded-2xl border border-white/[0.06] bg-[#090909] p-5 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-sm font-medium text-white">Persistent knowledge graph</p><p className="mt-1 text-xs text-zinc-600">{live ? `${nodes.length} indexed nodes · ${edges.length} visible edges` : 'Graph storage unavailable'}</p></div>
          <label className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-black/20 px-3 py-2"><Search className="h-3.5 w-3.5 text-zinc-700" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter graph" className="w-40 bg-transparent text-xs text-zinc-300 outline-none placeholder:text-zinc-700" /></label>
        </div>
        <div className="mt-5 grid max-h-[540px] gap-2 overflow-y-auto sm:grid-cols-2">
          {filtered.map((node) => <button key={node.id} type="button" onClick={() => setSelected(node.id)} className={`rounded-xl border p-4 text-left transition-colors ${active?.id === node.id ? 'border-electric-cyan/30 bg-electric-cyan/[0.06]' : 'border-white/[0.05] bg-white/[0.015] hover:border-white/[0.1]'}`}><div className="flex items-center justify-between gap-3"><span className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-700">{node.nodeType}</span><span className="text-[10px] text-zinc-700">{node.domain}</span></div><p className="mt-3 text-sm font-medium text-zinc-200">{node.title}</p>{node.technology && <p className="mt-2 text-[11px] text-zinc-600">{node.technology}</p>}</button>)}
        </div>
      </section>

      <aside className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
        {active ? <>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-700">Selected node</p>
          <h2 className="mt-4 text-2xl font-medium tracking-tight text-white">{active.title}</h2>
          <div className="mt-3 flex flex-wrap gap-2"><span className="rounded-lg border border-white/[0.06] px-2 py-1 text-[10px] text-zinc-500">{active.nodeType}</span><span className="rounded-lg border border-white/[0.06] px-2 py-1 text-[10px] text-zinc-500">{active.domain}</span>{active.technology && <span className="rounded-lg border border-white/[0.06] px-2 py-1 text-[10px] text-zinc-500">{active.technology}</span>}</div>
          {active.sourceUrl && <a href={active.sourceUrl} className="mt-5 inline-flex items-center gap-1.5 text-xs text-electric-cyan" target={active.sourceUrl.startsWith('http') ? '_blank' : undefined} rel={active.sourceUrl.startsWith('http') ? 'noreferrer' : undefined}>Open source <ArrowUpRight className="h-3 w-3" /></a>}
          <div className="mt-7 border-t border-white/[0.05] pt-5"><p className="text-xs font-medium text-zinc-300">Connected knowledge</p><div className="mt-3 space-y-2">{connected.map((node) => <button type="button" key={node.id} onClick={() => setSelected(node.id)} className="flex w-full items-center justify-between rounded-xl border border-white/[0.05] bg-black/20 px-3 py-3 text-left"><div><p className="text-xs text-zinc-300">{node.title}</p><p className="mt-1 text-[10px] text-zinc-700">{node.nodeType} · {node.domain}</p></div><ArrowUpRight className="h-3 w-3 text-zinc-700" /></button>)}</div>{!connected.length && <p className="mt-3 text-xs text-zinc-700">No visible edges connect this node yet.</p>}</div>
        </> : <p className="text-sm text-zinc-600">Select a graph node.</p>}
      </aside>
    </div>
  )
}
