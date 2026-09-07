import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BlogFilterClient from '@/components/BlogFilterClient'
import { getContentPosts, getBuiltInContentStats } from '@/lib/content/content-service'

export default async function BlogPage() {
  const [allPosts, stats] = await Promise.all([
    getContentPosts({ status: 'published', limit: 80 }),
    Promise.resolve(getBuiltInContentStats()),
  ])

  return (
    <main className="min-h-screen bg-deep-charcoal">
      <Navbar />

      <section className="relative pt-28 pb-20 overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-30" />
        <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-electric-cyan/[0.03] rounded-full blur-[120px]" />

        <div className="relative container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-xs text-electric-cyan uppercase tracking-widest font-medium mb-3">Engineering Knowledge Base</p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Production Engineering Guides
            </h1>
            <p className="text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed">
              {stats.articles}+ practical guides across cloud-native architecture, Kubernetes, platform engineering, reliability, security, distributed systems, Go, and AI infrastructure.
            </p>
          </div>

          <BlogFilterClient initialPosts={allPosts} />
        </div>
      </section>

      <Footer />
    </main>
  )
}
