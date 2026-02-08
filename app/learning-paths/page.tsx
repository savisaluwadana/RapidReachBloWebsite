import Navbar from '@/components/Navbar'
import { BookOpen, Clock, Users, CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const learningPaths = [
  {
    id: 1,
    title: 'Kubernetes Fundamentals',
    description: 'Master the basics of Kubernetes from container orchestration to deployment strategies',
    level: 'Beginner',
    duration: '8 weeks',
    articles: 12,
    enrolled: 2450,
    topics: ['Pods & Deployments', 'Services & Networking', 'ConfigMaps & Secrets', 'Persistent Storage']
  },
  {
    id: 2,
    title: 'Platform Engineering Mastery',
    description: 'Build and scale internal developer platforms with modern tools and practices',
    level: 'Advanced',
    duration: '12 weeks',
    articles: 18,
    enrolled: 1200,
    topics: ['IDP Design', 'Developer Experience', 'Self-Service Platforms', 'GitOps Workflows']
  },
  {
    id: 3,
    title: 'CI/CD Pipeline Excellence',
    description: 'Design, implement, and optimize continuous integration and delivery pipelines',
    level: 'Intermediate',
    duration: '6 weeks',
    articles: 10,
    enrolled: 3100,
    topics: ['Pipeline Design', 'Testing Automation', 'Deployment Strategies', 'Security Scanning']
  },
]

export default function LearningPathsPage() {
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
          {learningPaths.map((path) => (
            <div
              key={path.id}
              className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-8 hover:bg-white/10 transition-all hover:scale-[1.02]"
            >
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 rounded-lg bg-electric-cyan/10 text-electric-cyan text-sm font-semibold">
                      {path.level}
                    </span>
                    <span className="flex items-center gap-2 text-gray-400 text-sm">
                      <Clock className="w-4 h-4" />
                      {path.duration}
                    </span>
                    <span className="flex items-center gap-2 text-gray-400 text-sm">
                      <BookOpen className="w-4 h-4" />
                      {path.articles} articles
                    </span>
                    <span className="flex items-center gap-2 text-gray-400 text-sm">
                      <Users className="w-4 h-4" />
                      {path.enrolled.toLocaleString()} enrolled
                    </span>
                  </div>
                  
                  <h2 className="text-3xl font-bold text-white mb-3">{path.title}</h2>
                  <p className="text-gray-400 mb-6">{path.description}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {path.topics.map((topic) => (
                      <span
                        key={topic}
                        className="px-3 py-1 rounded-full bg-white/5 text-gray-300 text-sm"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Link
                    href="/blog"
                    className="px-8 py-4 rounded-xl bg-gradient-cyber text-white font-semibold shadow-glow-lg hover:shadow-glow-xl transition-all hover:scale-105 flex items-center gap-2"
                  >
                    Start Learning
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
