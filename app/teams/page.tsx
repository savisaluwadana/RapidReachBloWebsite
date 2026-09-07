import { Building2, Gauge, Network, ShieldCheck, Users } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const capabilities = [
  [Users, 'Organization skills graph', 'See competency coverage by team, service ownership, role, and critical technology.'],
  [Network, 'Private stack graph', 'Connect infrastructure inventory, repositories, services, and ownership to RapidReach intelligence.'],
  [Gauge, 'Readiness & onboarding', 'Create role-specific pathways and measure operational readiness beyond course completion.'],
  [ShieldCheck, 'Engineering risk intelligence', 'Correlate upstream changes with exposed systems and missing human capability.'],
]

export default function TeamsPage() {
  return (
    <main className="min-h-screen bg-deep-charcoal text-white">
      <Navbar />
      <section className="border-b border-white/[0.05]"><div className="container mx-auto px-6 py-20 md:py-24"><div className="mx-auto max-w-6xl"><div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-electric-cyan" /><p className="premium-section-label">RapidReach Teams</p></div><h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.045em] md:text-6xl">Know what your engineering organization can safely operate.</h1><p className="mt-6 max-w-2xl text-base leading-7 text-zinc-500">The enterprise product combines team competency, infrastructure context, incident performance, and ecosystem intelligence into one operating picture.</p></div></div></section>
      <section className="py-16"><div className="container mx-auto px-6"><div className="mx-auto max-w-6xl grid gap-3 md:grid-cols-2">{capabilities.map(([Icon, title, description]) => { const I = Icon as typeof Users; return <div key={String(title)} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6"><I className="h-4 w-4 text-electric-cyan" /><h2 className="mt-5 text-lg font-medium text-white">{String(title)}</h2><p className="mt-3 text-sm leading-6 text-zinc-500">{String(description)}</p></div> })}</div></div></section>
      <Footer />
    </main>
  )
}
