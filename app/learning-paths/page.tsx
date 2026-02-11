import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { BookOpen, Clock, Users, CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { getLearningPaths } from '@/lib/actions/learning-paths'

export default async function LearningPathsPage() {
  const learningPaths = await getLearningPaths()
  return (
    <main className="min-h-screen bg-deep-charcoal">
      <Navbar />
      
      <div className="container mx-auto px-6 pt-32 pb-20">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white via-electric-cyan to-cyber-lime bg-clip-text text-transparent">
              Learning Paths
            </span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed">
            Structured journeys to master DevOps and Cloud Native technologies
          </p>
        </div>

        {/* Learning Paths */}
        <div className="max-w-7xl mx-auto space-y-6">
          {learningPaths.length > 0 ? (
            learningPaths.map((path) => (
              <div
                key={path.id}
                className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-8 hover:bg-white/10 transition-all hover:scale-[1.02]"
              >
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1 rounded-lg bg-electric-cyan/10 text-electric-cyan text-sm font-semibold uppercase">
                        {path.difficulty}
                      </span>
                      <span className="flex items-center gap-2 text-gray-400 text-sm">
                        <Clock className="w-4 h-4" />
                        {path.estimated_duration ? `${Math.ceil(path.estimated_duration / 40)} weeks` : 'Self-paced'}
                      </span>
                      <span className="flex items-center gap-2 text-gray-400 text-sm">
                        <BookOpen className="w-4 h-4" />
                        {path.modules.length} modules
                      </span>
                      <span className="flex items-center gap-2 text-gray-400 text-sm">
                        <Users className="w-4 h-4" />
                        {path.enrollment_count.toLocaleString()} enrolled
                      </span>
                    </div>
                    
                    <h2 className="text-3xl font-bold text-white mb-3">{path.title}</h2>
                    <p className="text-gray-400 mb-6">{path.description}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {path.modules.map((module) => (
                        <span
                          key={module.order}
                          className="px-3 py-1 rounded-full bg-white/5 text-gray-300 text-sm"
                        >
                          {module.title}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Link
                      href={`/learning-paths/${path.slug}`}
                      className="px-8 py-4 rounded-xl bg-gradient-cyber text-white font-semibold shadow-glow-lg hover:shadow-glow-xl transition-all hover:scale-105 flex items-center gap-2"
                    >
                      Start Learning
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Learning Paths Yet</h3>
              <p className="text-gray-400 mb-4">We're working on creating amazing learning paths for you!</p>
              <p className="text-sm text-electric-cyan">💡 Configure Supabase to load real learning paths (see SETUP_GUIDE.md)</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}
