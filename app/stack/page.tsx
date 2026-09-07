import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import StackImpactExplorer from '@/components/StackImpactExplorer'
import { getIntelligenceView, getStackView } from '@/lib/rapidreach/read-model'

export default async function StackPage() {
  const [technologies, signals] = await Promise.all([getStackView(), getIntelligenceView()])
  return (
    <main className="min-h-screen bg-deep-charcoal text-white">
      <Navbar />
      <section className="border-b border-white/[0.05]"><div className="container mx-auto px-6 py-20"><div className="mx-auto max-w-6xl"><p className="premium-section-label">Stack Graph</p><h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.045em] md:text-6xl">Turn your technology inventory into an engineering risk graph.</h1><p className="mt-6 max-w-2xl text-base leading-7 text-zinc-500">Model cloud, runtime, delivery, networking, observability, and security dependencies so RapidReach can explain which upstream changes affect your environment and why.</p></div></div></section>
      <section className="py-16"><div className="container mx-auto px-6"><div className="mx-auto max-w-6xl"><StackImpactExplorer technologies={technologies} signals={signals} /></div></div></section>
      <Footer />
    </main>
  )
}
