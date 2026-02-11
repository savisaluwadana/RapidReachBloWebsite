'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
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
      // For now, store in localStorage as a simple subscriber list
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
        <div className="container mx-auto px-6 pt-32 pb-20">
          <div className="max-w-2xl mx-auto text-center">
            <CheckCircle className="w-20 h-20 text-cyber-lime mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">You're Subscribed!</h1>
            <p className="text-xl text-gray-400 mb-8">
              Welcome aboard, {name || 'friend'}! You'll receive our weekly DevOps insights at <span className="text-electric-cyan">{email}</span>.
            </p>
            <a
              href="/"
              className="px-8 py-4 rounded-xl bg-gradient-cyber text-white font-bold inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              Explore Articles
            </a>
          </div>
        </div>
      </main>
    )
  }
  return (
    <main className="min-h-screen bg-deep-charcoal">
      <Navbar />
      
      <div className="container mx-auto px-6 pt-32 pb-20">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Mail className="w-16 h-16 text-electric-cyan mx-auto mb-6" />
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white via-electric-cyan to-cyber-lime bg-clip-text text-transparent">
                Subscribe to RapidReach
              </span>
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed">
              Get weekly insights delivered straight to your inbox
            </p>
          </div>

          {/* Benefits */}
          <div className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">What you'll get:</h2>
            <div className="space-y-4">
              {[
                'Weekly curated DevOps and Platform Engineering articles',
                'Exclusive tutorials and deep-dives',
                'Early access to new features and content',
                'Community highlights and success stories',
                'No spam, unsubscribe anytime'
              ].map((benefit, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-cyber-lime flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Subscribe Form */}
          <div className="rounded-2xl backdrop-blur-xl bg-gradient-cyber p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white font-semibold mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur-xl border border-white/30 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                  required
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">First Name (Optional)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur-xl border border-white/30 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
              {error && (
                <p className="text-sm text-red-200 bg-red-500/20 px-4 py-2 rounded-lg">{error}</p>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-4 rounded-xl bg-white text-electric-cyan font-bold hover:bg-white/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Zap className="w-5 h-5" />
                {isSubmitting ? 'Subscribing...' : 'Subscribe Now'}
              </button>
            </form>

          </div>
        </div>
      </div>
    </main>
  )
}
