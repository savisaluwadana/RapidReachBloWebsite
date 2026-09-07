import { ArrowRight, BrainCircuit, Network, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import IntelligenceFeed from '@/components/IntelligenceFeed'
import { getIntelligenceView } from '@/lib/rapidreach/read-model'

export default async function IntelligencePage() {
  const signals = await getIntelligenceView()
  return (
    <main className="min-h-screen bg-deep-charcoal text-white">
      <Navbar />
      <section className="border-b border-white/[0.05] bg-[radial-gradient(circle_at_30%_0%,rgba(50,108,229,.12),transparent_35%)]">
        <div className="container mx-auto px-6 py-20 md:py-24"><div className="mx-auto max-w-6xl">
          <p className="premium-section-label">RapidReach Intelligence</p>
          <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.045em] md:text-6xl">Know what changed. Know whether it matters to you.</h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-500">RapidReach turns releases, security advisories, platform changes, and engineering knowledge into stack-aware actions instead of another unread feed.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link href="/stack" className="premium-button-primary">Connect a stack <ArrowRight className="h-4 w-4" /></Link><Link href="/mcp" className="premium-button-secondary">Use through MCP</Link></div>
          <div className="mt-12 grid gap-3 md:grid-cols-3">{[
            [BrainCircuit, 'Context engine', 'Explains the architecture and failure modes behind a change.'],
            [Network, 'Dependency graph', 'Maps technologies, services, teams, and affected infrastructure.'],
            [ShieldCheck, 'Risk translation', 'Converts upstream noise into an action priority for your environment.'],
          ].map(([Icon, title, description]) => { const I = Icon as typeof BrainCircuit; return <div key={String(title)} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"><I className="h-4 w-4 text-electric-cyan" /><h2 className="mt-5 text-sm font-medium text-white">{String(title)}</h2><p className="mt-2 text-xs leading-5 text-zinc-600">{String(description)}</p></div> })}</div>
        </div></div>
      </section>
      <section className="py-16 md:py-20"><div className="container mx-auto px-6"><div className="mx-auto max-w-6xl"><IntelligenceFeed signals={signals} /></div></div></section>
      <Footer />
    </main>
  )
}
