import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import IncidentSimulator from '@/components/IncidentSimulator'
import ManifestReviewLab from '@/components/ManifestReviewLab'

export default function LabsPage() {
  return (
    <main className="min-h-screen bg-deep-charcoal text-white">
      <Navbar />
      <section className="border-b border-white/[0.05]"><div className="container mx-auto px-6 py-20"><div className="mx-auto max-w-6xl"><p className="premium-section-label">RapidReach Labs</p><h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.045em] md:text-6xl">Practice production reasoning before production breaks.</h1><p className="mt-6 max-w-2xl text-base leading-7 text-zinc-500">Work through incidents using metrics, traces, logs, and events, then review real infrastructure configuration. RapidReach evaluates evidence-driven diagnosis, safe remediation, and production-readiness—not memorization.</p></div></div></section>
      <section className="py-16"><div className="container mx-auto px-6"><div className="mx-auto max-w-6xl"><p className="premium-section-label">Incident simulation</p><h2 className="mb-8 mt-3 text-2xl font-medium tracking-tight text-white">Diagnose a failing production system.</h2><IncidentSimulator /></div></div></section>
      <section className="border-t border-white/[0.05] py-16"><div className="container mx-auto px-6"><div className="mx-auto max-w-6xl"><p className="premium-section-label">Infrastructure playground</p><h2 className="mb-8 mt-3 text-2xl font-medium tracking-tight text-white">Review a Kubernetes workload like an operator.</h2><ManifestReviewLab /></div></div></section>
      <Footer />
    </main>
  )
}
