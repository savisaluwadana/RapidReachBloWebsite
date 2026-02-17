import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { Users, Target, Zap, BookOpen, ArrowRight } from 'lucide-react'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-deep-charcoal">
      <Navbar />

      <div className="container mx-auto px-6 pt-28 pb-20">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-xs text-electric-cyan uppercase tracking-widest font-medium mb-3">About Us</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            About RapidReach
          </h1>
          <p className="text-sm text-gray-500 max-w-lg mx-auto">
            Empowering DevOps professionals with practitioner-written, concept-first content.
          </p>
        </div>

        {/* Mission */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-8 md:p-10 text-center">
            <Target className="w-10 h-10 text-electric-cyan mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-3">Our Mission</h2>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xl mx-auto">
              To bridge the gap between DevOps theory and practice by providing high-quality,
              actionable content that helps engineers master Cloud Native technologies and
              Platform Engineering principles.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-lg font-semibold text-white text-center mb-8">What We Stand For</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                icon: <BookOpen className="w-8 h-8 text-electric-cyan" />,
                title: 'Quality Content',
                description: 'Every article is thoroughly researched, tested, and reviewed by industry practitioners.',
              },
              {
                icon: <Users className="w-8 h-8 text-cyber-lime" />,
                title: 'Community First',
                description: 'Built by practitioners, for practitioners. Real-world experience over theoretical knowledge.',
              },
              {
                icon: <Zap className="w-8 h-8 text-[#5C4EE5]" />,
                title: 'Always Current',
                description: 'Staying ahead of the curve with the latest tools, patterns, and production best practices.',
              },
            ].map((value) => (
              <div
                key={value.title}
                className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-6 text-center hover:bg-white/[0.04] transition-colors"
              >
                <div className="mx-auto mb-3 w-fit">{value.icon}</div>
                <h3 className="text-sm font-semibold text-white mb-2">{value.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Join Our Community</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
            Be part of a growing community of DevOps professionals sharing knowledge and best practices.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-electric-cyan text-white text-sm font-medium hover:bg-electric-cyan/90 transition-colors"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  )
}
