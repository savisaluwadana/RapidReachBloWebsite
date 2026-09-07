import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import EngineeringAtlas from '@/components/EngineeringAtlas'
import { getSiteStats } from '@/lib/actions/posts'

export default async function GraphPage() {
  const stats = await getSiteStats()
  return (
    <main className="min-h-screen bg-deep-charcoal text-white">
      <Navbar />
      <section className="border-b border-white/[0.05]"><div className="container mx-auto px-6 py-20"><div className="mx-auto max-w-6xl"><p className="premium-section-label">Engineering Knowledge Graph</p><h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.045em] md:text-6xl">Learn the connections between systems, not isolated tool pages.</h1><p className="mt-6 max-w-2xl text-base leading-7 text-zinc-500">The graph connects runtime, delivery, platforms, cloud, reliability, and security so every concept can lead to its dependencies, failure modes, labs, and operational consequences.</p></div></div></section>
      <section className="py-16"><div className="container mx-auto px-6"><div className="mx-auto max-w-4xl"><EngineeringAtlas totalPosts={stats.totalPosts} totalUsers={stats.totalUsers} /></div></div></section>
      <Footer />
    </main>
  )
}
