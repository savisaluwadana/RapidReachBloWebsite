import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import EngineeringAtlas from '@/components/EngineeringAtlas'
import KnowledgeGraphExplorer from '@/components/KnowledgeGraphExplorer'
import { getSiteStats } from '@/lib/actions/posts'
import { getKnowledgeGraphView } from '@/lib/rapidreach/knowledge/view'

export default async function GraphPage() {
  const [stats, graph] = await Promise.all([getSiteStats(), getKnowledgeGraphView()])
  return (
    <main className="min-h-screen bg-deep-charcoal text-white">
      <Navbar />
      <section className="border-b border-white/[0.05]"><div className="container mx-auto px-6 py-20"><div className="mx-auto max-w-6xl"><p className="premium-section-label">Engineering Knowledge Graph</p><h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.045em] md:text-6xl">Learn the connections between systems, not isolated tool pages.</h1><p className="mt-6 max-w-2xl text-base leading-7 text-zinc-500">The graph connects articles, upstream intelligence and your private stack so dependencies, failure modes and affected systems become queryable evidence rather than static navigation.</p></div></div></section>
      <section className="py-16"><div className="container mx-auto px-6"><div className="mx-auto max-w-6xl"><KnowledgeGraphExplorer nodes={graph.nodes} edges={graph.edges} live={graph.live} /></div></div></section>
      <section className="border-t border-white/[0.05] py-16"><div className="container mx-auto px-6"><div className="mx-auto max-w-4xl"><div className="mb-6"><p className="premium-section-label">Domain atlas</p><p className="mt-3 text-sm text-zinc-600">The conceptual atlas remains the high-level map; the graph above is backed by persisted indexed data.</p></div><EngineeringAtlas totalPosts={stats.totalPosts} totalUsers={stats.totalUsers} /></div></div></section>
      <Footer />
    </main>
  )
}
