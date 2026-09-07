'use client'

import { useMemo, useState } from 'react'
import { CheckCircle2, Code2, ShieldAlert } from 'lucide-react'

const starter = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: checkout-api
spec:
  replicas: 1
  selector:
    matchLabels:
      app: checkout-api
  template:
    metadata:
      labels:
        app: checkout-api
    spec:
      containers:
        - name: checkout-api
          image: ghcr.io/example/checkout:latest
          ports:
            - containerPort: 8080`

function review(manifest: string) {
  const m = manifest.toLowerCase()
  const findings: { severity: 'high' | 'medium' | 'good'; text: string }[] = []
  if (m.includes(':latest')) findings.push({ severity: 'high', text: 'Mutable :latest image tag makes rollbacks and provenance unreliable.' })
  if (!m.includes('resources:')) findings.push({ severity: 'high', text: 'No CPU/memory requests or limits are defined.' })
  if (!m.includes('readinessprobe')) findings.push({ severity: 'medium', text: 'No readiness probe: traffic can reach a pod before it is ready.' })
  if (!m.includes('securitycontext')) findings.push({ severity: 'medium', text: 'No securityContext: review non-root execution, capabilities, privilege, and filesystem policy.' })
  if (!m.includes('strategy:')) findings.push({ severity: 'medium', text: 'No explicit rollout strategy: validate availability expectations during deployment.' })
  if (!m.includes('poddisruptionbudget')) findings.push({ severity: 'medium', text: 'Consider a PodDisruptionBudget for workloads that require availability during voluntary disruption.' })
  if (findings.length === 0) findings.push({ severity: 'good', text: 'No seed-rule findings. Continue with RBAC, network policy, autoscaling, topology, SLO, and workload-specific review.' })
  return findings
}

export default function ManifestReviewLab() {
  const [manifest, setManifest] = useState(starter)
  const findings = useMemo(() => review(manifest), [manifest])
  return (
    <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
      <section className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#080808]">
        <div className="flex items-center gap-2 border-b border-white/[0.05] px-5 py-3"><Code2 className="h-4 w-4 text-electric-cyan" /><p className="text-sm font-medium text-white">Manifest review playground</p></div>
        <textarea value={manifest} onChange={(event) => setManifest(event.target.value)} spellCheck={false} className="min-h-[470px] w-full resize-y bg-transparent p-5 font-mono text-xs leading-6 text-zinc-300 outline-none" aria-label="Kubernetes manifest" />
      </section>
      <aside className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
        <div className="flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-amber-300" /><p className="text-sm font-medium text-white">Production-readiness review</p></div>
        <p className="mt-2 text-xs leading-5 text-zinc-600">This browser lab uses deterministic checks. The MCP server exposes the same review concept to IDEs and agents.</p>
        <div className="mt-5 space-y-3">{findings.map((finding, index) => <div key={`${finding.text}-${index}`} className="rounded-xl border border-white/[0.05] bg-black/20 p-4"><div className="flex gap-3">{finding.severity === 'good' ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyber-lime" /> : <ShieldAlert className={`mt-0.5 h-4 w-4 shrink-0 ${finding.severity === 'high' ? 'text-red-400' : 'text-amber-300'}`} />}<p className="text-xs leading-5 text-zinc-400">{finding.text}</p></div></div>)}</div>
      </aside>
    </div>
  )
}
