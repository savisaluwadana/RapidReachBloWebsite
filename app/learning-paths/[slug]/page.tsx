import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { BookOpen, Clock, Users, CheckCircle, Star, ArrowRight } from 'lucide-react'
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
      
      <div className="container mx-auto px-6 pt-32 pb-20">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-4 py-2 rounded-lg bg-electric-cyan/10 text-electric-cyan font-semibold uppercase">
              {learningPath.difficulty}
            </span>
            <span className="flex items-center gap-2 text-gray-400">
              <Clock className="w-5 h-5" />
              {learningPath.estimated_duration ? `${Math.ceil(learningPath.estimated_duration / 40)} weeks` : 'Self-paced'}
            </span>
            <span className="flex items-center gap-2 text-gray-400">
              <Users className="w-5 h-5" />
              {learningPath.enrollment_count.toLocaleString()} enrolled
            </span>
            {learningPath.average_rating > 0 && (
              <span className="flex items-center gap-2 text-gray-400">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                {learningPath.average_rating.toFixed(1)}
              </span>
            )}
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            {learningPath.title}
          </h1>

          <p className="text-xl text-gray-300 leading-relaxed mb-8">
            {learningPath.description}
          </p>

          <button className="px-8 py-4 rounded-xl bg-gradient-cyber text-white font-semibold shadow-glow-lg hover:shadow-glow-xl transition-all hover:scale-105 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Enroll Now
          </button>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Modules */}
            <div className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Course Curriculum</h2>
              <div className="space-y-4">
                {learningPath.modules.map((module, index) => (
                  <div
                    key={module.order}
                    className="rounded-xl bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-cyber flex items-center justify-center text-white font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">{module.title}</h3>
                        <p className="text-gray-400">{module.description}</p>
                      </div>
                      <CheckCircle className="w-6 h-6 text-gray-600 flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Outcomes */}
            {learningPath.learning_outcomes.length > 0 && (
              <div className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-8">
                <h2 className="text-2xl font-bold text-white mb-6">What You'll Learn</h2>
                <div className="space-y-3">
                  {learningPath.learning_outcomes.map((outcome, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-cyber-lime flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{outcome}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Prerequisites */}
            {learningPath.prerequisites.length > 0 && (
              <div className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Prerequisites</h3>
                <ul className="space-y-2">
                  {learningPath.prerequisites.map((prereq, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-400">
                      <span className="text-electric-cyan mt-1">•</span>
                      <span>{prereq}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Stats */}
            <div className="rounded-2xl backdrop-blur-xl bg-gradient-to-br from-electric-cyan/10 to-cyber-lime/10 border border-electric-cyan/20 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Course Stats</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-3xl font-bold gradient-text">
                    {learningPath.enrollment_count.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">Students Enrolled</div>
                </div>
                <div>
                  <div className="text-3xl font-bold gradient-text">
                    {learningPath.completion_rate.toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-400">Completion Rate</div>
                </div>
                {learningPath.average_rating > 0 && (
                  <div>
                    <div className="text-3xl font-bold gradient-text flex items-center gap-2">
                      {learningPath.average_rating.toFixed(1)}
                      <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                    </div>
                    <div className="text-sm text-gray-400">Average Rating</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
