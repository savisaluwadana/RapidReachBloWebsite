import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { BookOpen, Clock, Users, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { getLearningPaths } from '@/lib/actions/learning-paths'

export default async function LearningPathsPage() {
  const learningPaths = await getLearningPaths()
  return (
    <main className="min-h-screen bg-deep-charcoal">
      <Navbar />

      <div className="container mx-auto px-6 pt-28 pb-20">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="text-xs text-cyber-lime uppercase tracking-widest font-medium mb-3">Structured Learning</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Learning Paths</h1>
          <p className="text-sm text-gray-500 max-w-lg mx-auto">
            Step-by-step journeys to master DevOps and Cloud Native technologies.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {learningPaths.length > 0 ? (
            learningPaths.map((path) => (
              <Link
                key={path.id}
                href={`/learning-paths/${path.slug}`}
                className="group block rounded-xl bg-white/[0.02] border border-white/[0.04] p-6 hover:bg-white/[0.04] hover:border-white/[0.08] transition-all"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="px-2 py-0.5 rounded bg-electric-cyan/10 text-electric-cyan text-[10px] font-semibold uppercase tracking-wider">
                        {path.difficulty}
                      </span>
                      <span className="flex items-center gap-1 text-gray-600 text-xs">
                        <Clock className="w-3.5 h-3.5" />
                        {path.estimated_duration ? `${Math.ceil(path.estimated_duration / 40)} weeks` : 'Self-paced'}
                      </span>
                      <span className="flex items-center gap-1 text-gray-600 text-xs">
                        <BookOpen className="w-3.5 h-3.5" />
                        {path.modules.length} modules
                      </span>
                      <span className="flex items-center gap-1 text-gray-600 text-xs">
                        <Users className="w-3.5 h-3.5" />
                        {path.enrollment_count.toLocaleString()} enrolled
                      </span>
                    </div>

                    <h2 className="text-lg font-semibold text-white mb-2 group-hover:text-electric-cyan transition-colors">
                      {path.title}
                    </h2>
                    <p className="text-xs text-gray-500 mb-4 line-clamp-2">{path.description}</p>

                    <div className="flex flex-wrap gap-1.5">
                      {path.modules.map((module) => (
                        <span
                          key={module.order}
                          className="px-2 py-0.5 rounded bg-white/[0.03] text-gray-500 text-[10px] font-medium"
                        >
                          {module.title}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center lg:pl-4">
                    <span className="text-sm text-electric-cyan font-medium flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      Start Learning <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-10 text-center">
              <BookOpen className="w-10 h-10 text-gray-700 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-white mb-1">No Learning Paths Yet</h3>
              <p className="text-sm text-gray-500">We&apos;re working on creating structured learning paths for you.</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}
