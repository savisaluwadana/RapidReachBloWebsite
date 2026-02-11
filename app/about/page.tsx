import Navbar from '@/components/Navbar'
import { Users, Target, Zap, BookOpen, Heart } from 'lucide-react'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-deep-charcoal">
      <Navbar />
      
      <div className="container mx-auto px-6 pt-32 pb-20">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white via-electric-cyan to-cyber-lime bg-clip-text text-transparent">
              About RapidReach
            </span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed">
            Empowering DevOps professionals with cutting-edge insights and practical knowledge
          </p>
        </div>

        {/* Mission */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="rounded-2xl backdrop-blur-xl bg-gradient-to-br from-electric-cyan/10 to-cyber-lime/10 border border-electric-cyan/20 p-12 text-center">
            <Target className="w-16 h-16 text-electric-cyan mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Our Mission</h2>
            <p className="text-xl text-gray-300 leading-relaxed">
              To bridge the gap between DevOps theory and practice by providing high-quality, 
              actionable content that helps engineers master Cloud Native technologies and 
              Platform Engineering principles.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="max-w-7xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">What We Stand For</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-8 text-center">
              <BookOpen className="w-12 h-12 text-electric-cyan mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Quality Content</h3>
              <p className="text-gray-400">
                Every article is thoroughly researched, tested, and reviewed by industry experts
              </p>
            </div>
            <div className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-8 text-center">
              <Users className="w-12 h-12 text-cyber-lime mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Community First</h3>
              <p className="text-gray-400">
                Built by practitioners, for practitioners. We prioritize real-world experience
              </p>
            </div>
            <div className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-8 text-center">
              <Zap className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Always Current</h3>
              <p className="text-gray-400">
                Staying ahead of the curve with the latest tools, trends, and best practices
              </p>
            </div>
          </div>
        </div>



        {/* CTA */}
        <div className="max-w-4xl mx-auto mt-20 text-center">
          <Heart className="w-16 h-16 text-red-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Join Our Community</h2>
          <p className="text-xl text-gray-400 mb-8">
            Be part of a growing community of DevOps professionals sharing knowledge and best practices
          </p>
          <button className="px-8 py-4 rounded-xl bg-gradient-cyber text-white font-semibold shadow-glow-lg hover:shadow-glow-xl transition-all hover:scale-105">
            Get Started Free
          </button>
        </div>
      </div>
    </main>
  )
}
