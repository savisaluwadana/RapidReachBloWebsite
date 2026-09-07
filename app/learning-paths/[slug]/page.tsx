import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { BookOpen, Clock, CheckCircle, ArrowLeft, ArrowUpRight, Layers3 } from 'lucide-react'
import Link from 'next/link'
import { getContentLearningPathBySlug, getContentPostsByIds } from '@/lib/content/content-service'

export default async function LearningPathDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const learningPath = await getContentLearningPathBySlug(slug)

  if (!learningPath) {
    notFound()
  }

  const moduleArticles = learningPath.modules.map((module) => ({
    module,
    articles: getContentPostsByIds(module.post_ids),
  }))
  const readingCount = moduleArticles.reduce((total, item) => total + item.articles.length, 0)
  const firstReading = moduleArticles.flatMap((item) => item.articles)[0]

  return (
    <main className="min-h-screen bg-deep-charcoal">
      <Navbar />

      <div className="container mx-auto px-6 pt-28 pb-20">
        <div className="max-w-5xl mx-auto mb-8">
          <Link href="/learning-paths" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Learning Paths
          </Link>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-5">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="px-2 py-0.5 rounded bg-electric-cyan/10 text-electric-cyan text-[10px] font-semibold uppercase tracking-wider">
                  {learningPath.difficulty}
                </span>
                <span className="px-2 py-0.5 rounded bg-white/[0.03] text-gray-500 text-[10px] font-medium">
                  {learningPath.category}
                </span>
                <span className="flex items-center gap-1 text-gray-600 text-xs">
                  <Layers3 className="w-3.5 h-3.5" />
                  {learningPath.modules.length} modules
                </span>
                <span className="flex items-center gap-1 text-gray-600 text-xs">
                  <BookOpen className="w-3.5 h-3.5" />
                  {readingCount || learningPath.modules.reduce((total, module) => total + module.post_ids.length, 0)} readings
                </span>
                <span className="flex items-center gap-1 text-gray-600 text-xs">
                  <Clock className="w-3.5 h-3.5" />
                  Self-paced
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
                {learningPath.title}
              </h1>

              <p className="text-sm text-gray-400 leading-relaxed mb-6">
                {learningPath.description}
              </p>

              <Link
                href={firstReading ? `/blog/${firstReading.slug}` : '/articles'}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-electric-cyan text-white text-sm font-medium hover:bg-electric-cyan/90 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                {firstReading ? 'Start first reading' : 'Browse related articles'}
              </Link>
            </div>

            <div className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-5">
              <div className="flex items-center justify-between gap-3 mb-5">
                <div>
                  <h2 className="text-sm font-bold text-white">Curriculum</h2>
                  <p className="text-[11px] text-gray-600 mt-1">Work through the readings in order, then apply the practice exercise inside each guide.</p>
                </div>
              </div>

              <div className="space-y-3">
                {moduleArticles.map(({ module, articles }, index) => (
                  <div
                    key={module.order}
                    className="rounded-lg bg-white/[0.02] border border-white/[0.05] p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-electric-cyan/10 border border-electric-cyan/20 flex items-center justify-center text-electric-cyan text-xs font-bold flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-white mb-1">{module.title}</h3>
                        <p className="text-xs text-gray-500 leading-relaxed">{module.description}</p>

                        {articles.length > 0 && (
                          <div className="mt-3 space-y-1.5">
                            {articles.map((article) => (
                              <Link
                                key={article.id}
                                href={`/blog/${article.slug}`}
                                className="group/article flex items-center justify-between gap-3 rounded-md bg-black/10 border border-white/[0.04] px-3 py-2.5 hover:bg-white/[0.035] hover:border-white/[0.08] transition-colors"
                              >
                                <div className="min-w-0">
                                  <p className="text-xs font-medium text-gray-300 group-hover/article:text-electric-cyan transition-colors line-clamp-1">{article.title}</p>
                                  <p className="text-[10px] text-gray-600 mt-0.5">{article.estimated_read_time} min · {article.difficulty}</p>
                                </div>
                                <ArrowUpRight className="w-3.5 h-3.5 text-gray-700 group-hover/article:text-electric-cyan flex-shrink-0 transition-colors" />
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {learningPath.learning_outcomes.length > 0 && (
              <div className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-5">
                <h2 className="text-sm font-bold text-white mb-4">What you&apos;ll be able to do</h2>
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

          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-5">
              <h3 className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest mb-4">Path structure</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold text-white">{learningPath.modules.length}</p>
                  <p className="text-[10px] text-gray-600 uppercase tracking-wider mt-0.5">Modules</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{readingCount || learningPath.modules.reduce((total, module) => total + module.post_ids.length, 0)}</p>
                  <p className="text-[10px] text-gray-600 uppercase tracking-wider mt-0.5">Readings</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/[0.05]">
                <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Format</p>
                <p className="text-xs text-gray-400">Mental models → production failure modes → debugging approach → hands-on practice.</p>
              </div>
            </div>

            {learningPath.prerequisites.length > 0 && (
              <div className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-5">
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

            <div className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-5">
              <h3 className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest mb-2">Engineering domain</h3>
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
