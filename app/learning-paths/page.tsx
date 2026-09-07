import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { BookOpen, Clock, Layers3, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { getContentLearningPaths, getBuiltInContentStats } from '@/lib/content/content-service'

export default async function LearningPathsPage() {
  const learningPaths = await getContentLearningPaths()
  const stats = getBuiltInContentStats()

  return (
    <main className="min-h-screen bg-deep-charcoal">
      <Navbar />

      <div className="container mx-auto px-6 pt-28 pb-20">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="text-xs text-cyber-lime uppercase tracking-widest font-medium mb-3">Structured Engineering Curriculum</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Learning Paths</h1>
          <p className="text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed">
            {stats.learningPaths} production-focused paths connected to {stats.articles}+ engineering guides. Learn the system, its failure modes, and how to debug it—not just the commands.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {learningPaths.map((path) => {
            const readings = path.modules.reduce((total, module) => total + module.post_ids.length, 0)
            return (
              <Link
                key={path.id}
                href={`/learning-paths/${path.slug}`}
                className="group block rounded-xl bg-white/[0.02] border border-white/[0.05] p-6 hover:bg-white/[0.04] hover:border-white/[0.09] transition-all"
              >
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="px-2 py-0.5 rounded bg-electric-cyan/10 text-electric-cyan text-[10px] font-semibold uppercase tracking-wider">
                    {path.difficulty}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/[0.03] text-gray-500 text-[10px] font-medium">
                    {path.category}
                  </span>
                  {path.featured && (
                    <span className="px-2 py-0.5 rounded bg-cyber-lime/10 text-cyber-lime text-[10px] font-semibold uppercase tracking-wider">
                      Core path
                    </span>
                  )}
                </div>

                <h2 className="text-lg font-semibold text-white mb-2 group-hover:text-electric-cyan transition-colors">
                  {path.title}
                </h2>
                <p className="text-xs text-gray-500 mb-5 leading-relaxed min-h-10">{path.description}</p>

                <div className="flex items-center gap-4 text-[11px] text-gray-600 mb-5">
                  <span className="flex items-center gap-1.5">
                    <Layers3 className="w-3.5 h-3.5" />
                    {path.modules.length} modules
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    {readings} readings
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Self-paced
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-5">
                  {path.modules.slice(0, 4).map((module) => (
                    <span
                      key={module.order}
                      className="px-2 py-0.5 rounded bg-white/[0.025] border border-white/[0.04] text-gray-500 text-[10px] font-medium"
                    >
                      {module.title}
                    </span>
                  ))}
                </div>

                <span className="text-xs text-electric-cyan font-medium flex items-center gap-1.5">
                  Explore curriculum <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      <Footer />
    </main>
  )
}
