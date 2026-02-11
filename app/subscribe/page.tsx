import Navbar from '@/components/Navbar'
import { Mail, CheckCircle, Zap } from 'lucide-react'

export default function SubscribePage() {
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
            <form className="space-y-4">
              <div>
                <label className="block text-white font-semibold mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur-xl border border-white/30 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                  required
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">First Name (Optional)</label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur-xl border border-white/30 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
              <button
                type="submit"
                className="w-full px-6 py-4 rounded-xl bg-white text-electric-cyan font-bold hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                Subscribe Now
              </button>
            </form>

          </div>
        </div>
      </div>
    </main>
  )
}
