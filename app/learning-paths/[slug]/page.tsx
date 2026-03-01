import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { BookOpen, Clock, Users, CheckCircle, Star, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getLearningPathBySlug } from '@/lib/actions/learning-paths'

export default async function LearningPathDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const learningPath = await getLearningPathBySlug(slug)

  if (!learningPath) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-deep-charcoal">
      <Navbar />

      <div className="container mx-auto px-6 pt-28 pb-20">
        {/* Back */}
        <div className="max-w-5xl mx-auto mb-8">
          <Link href="/learning-paths" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Learning Paths
          </Link>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-5">
            {/* Header */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="px-2 py-0.5 rounded bg-electric-cyan/10 text-electric-cyan text-[10px] font-semibold uppercase tracking-wider">
                  {learningPath.difficulty}
                </span>
                <span className="flex items-center gap-1 text-gray-600 text-xs">
                  <Clock className="w-3.5 h-3.5" />
                  {learningPath.estimated_duration ? `${Math.ceil(learningPath.estimated_duration / 40)} weeks` : 'Self-paced'}
                </span>
                <span className="flex items-center gap-1 text-gray-600 text-xs">
                  <Users className="w-3.5 h-3.5" />
                  {learningPath.enrollment_count.toLocaleString()} enrolled
                </span>
                {learningPath.average_rating > 0 && (
                  <span className="flex items-center gap-1 text-gray-600 text-xs">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    {learningPath.average_rating.toFixed(1)}
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
                {learningPath.title}
              </h1>

              <p className="text-sm text-gray-400 leading-relaxed mb-6">
                {learningPath.description}
              </p>

              <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-electric-cyan text-white text-sm font-medium hover:bg-electric-cyan/90 transition-colors">
                <BookOpen className="w-4 h-4" />
                Enroll Now
              </button>
            </div>

            {/* Modules */}
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5">
              <h2 className="text-sm font-bold text-white mb-4">Course Curriculum</h2>
              <div className="space-y-2.5">
                {learningPath.modules.map((module, index) => (
                  <div
                    key={module.order}
                    className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-4 hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-electric-cyan/10 border border-electric-cyan/20 flex items-center justify-center text-electric-cyan text-xs font-bold flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-white mb-0.5">{module.title}</h3>
                        <p className="text-xs text-gray-500">{module.description}</p>
                      </div>
                      <CheckCircle className="w-4 h-4 text-gray-700 flex-shrink-0 mt-0.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Outcomes */}
            {learningPath.learning_outcomes.length > 0 && (
              <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5">
                <h2 className="text-sm font-bold text-white mb-4">What You&apos;ll Learn</h2>
                <div className="space-y-2.5">
                  {learningPath.learning_outcomes.map((outcome, index) => (
                    <div key={index} className="flex items-start gap-2.5">
                      <CheckCircle className="w-3.5 h-3.5 text-cyber-lime flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-gray-400">{outcome}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Stats */}
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5">
              <h3 className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest mb-4">Course Stats</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-2xl font-bold text-white">{learningPath.enrollment_count.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-600 uppercase tracking-wider mt-0.5">Students Enrolled</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{learningPath.completion_rate.toFixed(0)}%</p>
                  <p className="text-[10px] text-gray-600 uppercase tracking-wider mt-0.5">Completion Rate</p>
                </div>
                {learningPath.average_rating > 0 && (
                  <div>
                    <p className="text-2xl font-bold text-white flex items-center gap-1.5">
                      {learningPath.average_rating.toFixed(1)}
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    </p>
                    <p className="text-[10px] text-gray-600 uppercase tracking-wider mt-0.5">Average Rating</p>
                  </div>
                )}
                <div>
                  <p className="text-2xl font-bold text-white">{learningPath.modules.length}</p>
                  <p className="text-[10px] text-gray-600 uppercase tracking-wider mt-0.5">Modules</p>
                </div>
              </div>
            </div>

            {/* Prerequisites */}
            {learningPath.prerequisites.length > 0 && (
              <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5">
                <h3 className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest mb-3">Prerequisites</h3>
                <ul className="space-y-2">
                  {learningPath.prerequisites.map((prereq, index) => (
                    <li key={index} className="flex items-start gap-2 text-xs text-gray-400">
                      <span className="text-electric-cyan mt-0.5 text-[10px]">▸</span>
                      {prereq}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Category */}
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5">
              <h3 className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest mb-2">Category</h3>
              <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] text-white text-xs font-medium">
                {learningPath.category}
              </span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
