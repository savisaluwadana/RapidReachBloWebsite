import { Building2, Gauge, Network, Settings2, ShieldCheck, Users } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getTeamDashboard } from '@/lib/rapidreach/read-model'

const capabilities = [
  [Users, 'Organization skills graph', 'See competency coverage by team, service ownership, role, and critical technology.'],
  [Network, 'Private stack graph', 'Connect infrastructure inventory, repositories, services, and ownership to RapidReach intelligence.'],
  [Gauge, 'Readiness & onboarding', 'Create role-specific pathways and measure operational readiness beyond course completion.'],
  [ShieldCheck, 'Engineering risk intelligence', 'Correlate upstream changes with exposed systems and missing human capability.'],
]

export default async function TeamsPage() {
  const dashboard = await getTeamDashboard()
  return (
    <main className="min-h-screen bg-deep-charcoal text-white">
      <Navbar />
      <section className="border-b border-white/[0.05]"><div className="container mx-auto px-6 py-20 md:py-24"><div className="mx-auto max-w-6xl"><div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-electric-cyan" /><p className="premium-section-label">RapidReach Teams</p></div><h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.045em] md:text-6xl">Know what your engineering organization can safely operate.</h1><p className="mt-6 max-w-2xl text-base leading-7 text-zinc-500">The enterprise product combines team competency, infrastructure context, incident performance, and ecosystem intelligence into one operating picture.</p><div className="mt-8"><Link href="/settings/platform" className="premium-button-primary">Configure organization <Settings2 className="h-4 w-4" /></Link></div></div></div></section>

      <section className="border-b border-white/[0.05] py-10"><div className="container mx-auto px-6"><div className="mx-auto max-w-6xl">
        <div className="mb-5 flex items-center justify-between gap-4"><div><p className="text-sm font-medium text-white">{dashboard.organizationName ?? 'Organization overview'}</p><p className="mt-1 text-xs text-zinc-600">{dashboard.live ? `${dashboard.plan ?? 'free'} plan · persisted organization data` : 'No organization connected yet · showing zero-state metrics'}</p></div>{dashboard.live && <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-emerald-300">Live</span>}</div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[
          ['Members', dashboard.members],
          ['Stack components', dashboard.stackComponents],
          ['High-risk signals', dashboard.openHighSignals],
          ['Avg. skill score', dashboard.averageSkill === null ? '—' : `${dashboard.averageSkill}%`],
        ].map(([label, value]) => <div key={String(label)} className="rounded-2xl border border-white/[0.06] bg-[#090909] p-5"><p className="text-2xl font-semibold text-white">{String(value)}</p><p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-zinc-700">{String(label)}</p></div>)}</div>
      </div></div></section>

      <section className="py-16"><div className="container mx-auto px-6"><div className="mx-auto max-w-6xl grid gap-3 md:grid-cols-2">{capabilities.map(([Icon, title, description]) => { const I = Icon as typeof Users; return <div key={String(title)} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6"><I className="h-4 w-4 text-electric-cyan" /><h2 className="mt-5 text-lg font-medium text-white">{String(title)}</h2><p className="mt-3 text-sm leading-6 text-zinc-500">{String(description)}</p></div> })}</div></div></section>
      <Footer />
    </main>
  )
}
