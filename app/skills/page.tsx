import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SkillsGraph from '@/components/SkillsGraph'

export default function SkillsPage() {
  return (
    <main className="min-h-screen bg-deep-charcoal text-white">
      <Navbar />
      <section className="border-b border-white/[0.05]"><div className="container mx-auto px-6 py-20"><div className="mx-auto max-w-6xl"><p className="premium-section-label">Skills Graph</p><h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.045em] md:text-6xl">Measure engineering capability, not course completion.</h1><p className="mt-6 max-w-2xl text-base leading-7 text-zinc-500">RapidReach models prerequisites, role expectations, labs, and incident performance to reveal the next competency that will actually improve your production judgment.</p></div></div></section>
      <section className="py-16"><div className="container mx-auto px-6"><div className="mx-auto max-w-6xl"><SkillsGraph /></div></div></section>
      <Footer />
    </main>
  )
}
