'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Mail, CheckCircle, Zap } from 'lucide-react'

export default function SubscribePage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsSubmitting(true)
    setError('')

    try {
      const subscribers = JSON.parse(localStorage.getItem('rapidreach_subscribers') || '[]')
      if (subscribers.some((s: any) => s.email === email)) {
        setError('This email is already subscribed!')
        return
      }
      subscribers.push({ email, name, subscribedAt: new Date().toISOString() })
      localStorage.setItem('rapidreach_subscribers', JSON.stringify(subscribers))
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-deep-charcoal">
        <Navbar />
        <div className="container mx-auto px-6 pt-28 pb-20">
          <div className="max-w-lg mx-auto text-center">
            <CheckCircle className="w-12 h-12 text-cyber-lime mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">You&apos;re Subscribed!</h1>
            <p className="text-sm text-gray-500 mb-6">
              Welcome aboard{name ? `, ${name}` : ''}! You&apos;ll receive our weekly DevOps insights at{' '}
              <span className="text-electric-cyan">{email}</span>.
            </p>
            <a
              href="/"
              className="inline-flex items-center px-5 py-2.5 rounded-lg bg-electric-cyan text-white text-sm font-medium hover:bg-electric-cyan/90 transition-colors"
            >
              Explore Articles
            </a>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-deep-charcoal">
      <Navbar />

      <div className="container mx-auto px-6 pt-28 pb-20">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-10">
            <Mail className="w-10 h-10 text-electric-cyan mx-auto mb-4" />
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Subscribe to RapidReach
            </h1>
            <p className="text-sm text-gray-500">
              Get weekly insights delivered straight to your inbox.
            </p>
          </div>

          <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-6 mb-5">
            <h2 className="text-sm font-semibold text-white mb-4">What you&apos;ll get:</h2>
            <div className="space-y-2.5">
              {[
                'Weekly curated DevOps and Platform Engineering articles',
                'Exclusive tutorials and deep-dives',
                'Early access to new features and content',
                'Community highlights and success stories',
                'No spam, unsubscribe anytime',
              ].map((benefit, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-cyber-lime flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-400">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-electric-cyan/90 to-[#5C4EE5]/90 p-6 relative overflow-hidden">
            <div className="absolute inset-0 dot-grid opacity-10" />
            <form onSubmit={handleSubmit} className="relative z-10 space-y-3">
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-3 py-2.5 rounded-lg bg-white/15 border border-white/20 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-white/40"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1.5">First Name (Optional)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-3 py-2.5 rounded-lg bg-white/15 border border-white/20 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-white/40"
                />
              </div>
              {error && (
                <p className="text-xs text-red-200 bg-red-500/20 px-3 py-2 rounded-lg">{error}</p>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 rounded-lg bg-white text-electric-cyan text-sm font-semibold hover:bg-white/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                {isSubmitting ? 'Subscribing...' : 'Subscribe Now'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
