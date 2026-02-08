'use client'

import Navbar from '@/components/Navbar'
import ReadingProgress from '@/components/ReadingProgress'
import ArticleActions from '@/components/ArticleActions'
import CommentsSection from '@/components/CommentsSection'
import { Calendar, Clock, User, Tag, TrendingUp } from 'lucide-react'
import Image from 'next/image'

export default function BlogPost() {
  return (
    <>
      <ReadingProgress />
      <Navbar />
      
      <main className="min-h-screen bg-deep-charcoal pt-24 pb-20">
        <article className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="max-w-4xl mx-auto mb-12">
            {/* Category & Trending Badge */}
            <div className="flex items-center gap-3 mb-6">
              <span className="px-4 py-2 rounded-lg bg-electric-cyan/20 text-electric-cyan font-semibold text-sm">
                Kubernetes
              </span>
              <span className="px-4 py-2 rounded-lg bg-cyber-lime/20 text-cyber-lime font-semibold text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Trending
              </span>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Kubernetes Resource Management: Best Practices for Production
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-6 text-gray-400 mb-8">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span className="font-semibold">Sarah Chen</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>Feb 15, 2026</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>8 min read</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {['Kubernetes', 'DevOps', 'Resource Management', 'Best Practices'].map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full bg-white/5 text-gray-300 text-sm hover:bg-white/10 transition-colors cursor-pointer">
                  #{tag}
                </span>
              ))}
            </div>

            {/* Cover Image */}
            <div className="aspect-video rounded-2xl overflow-hidden bg-gradient-mesh relative mb-8">
              <div className="absolute inset-0 flex items-center justify-center text-white/50 text-2xl font-bold">
                Cover Image
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_80px] gap-12">
            {/* Main Content */}
            <div className="max-w-4xl">
              <div className="prose prose-invert prose-lg max-w-none">
                <p className="text-xl text-gray-300 leading-relaxed mb-8">
                  Managing Kubernetes resources effectively is crucial for maintaining a healthy, efficient production cluster. 
                  In this comprehensive guide, we'll explore proven strategies and best practices that can help you optimize 
                  resource utilization while ensuring application reliability.
                </p>

                <h2 className="text-3xl font-bold text-white mt-12 mb-4">Understanding Resource Requests and Limits</h2>
                <p className="text-gray-300 leading-relaxed mb-6">
                  Resource requests and limits are fundamental concepts in Kubernetes resource management. They define how much 
                  CPU and memory your containers need and the maximum they're allowed to consume.
                </p>

                <div className="rounded-2xl bg-white/5 border border-white/10 p-6 my-8">
                  <pre className="text-sm text-gray-300 overflow-x-auto">
{`apiVersion: v1
kind: Pod
metadata:
  name: resource-demo
spec:
  containers:
  - name: app
    image: nginx
    resources:
      requests:
        memory: "128Mi"
        cpu: "500m"
      limits:
        memory: "256Mi"
        cpu: "1000m"`}
                  </pre>
                </div>

                <h2 className="text-3xl font-bold text-white mt-12 mb-4">Best Practices for Production</h2>
                
                <h3 className="text-2xl font-bold text-white mt-8 mb-4">1. Always Set Resource Requests</h3>
                <p className="text-gray-300 leading-relaxed mb-6">
                  Setting resource requests helps the Kubernetes scheduler make informed decisions about pod placement. 
                  Without requests, the scheduler has no way to understand your application's needs, potentially leading 
                  to node oversubscription and degraded performance.
                </p>

                <h3 className="text-2xl font-bold text-white mt-8 mb-4">2. Use Limits Wisely</h3>
                <p className="text-gray-300 leading-relaxed mb-6">
                  While limits prevent resource hogging, setting them too low can cause unnecessary OOMKills and throttling. 
                  Monitor your applications to understand their actual resource consumption patterns before setting limits.
                </p>

                <div className="rounded-2xl bg-electric-cyan/10 border border-electric-cyan/30 p-6 my-8">
                  <div className="flex gap-3">
                    <div className="text-electric-cyan text-2xl">💡</div>
                    <div>
                      <h4 className="font-bold text-white mb-2">Pro Tip</h4>
                      <p className="text-gray-300">
                        Start with generous limits based on monitoring data, then gradually tune them down as you 
                        understand your application's behavior better.
                      </p>
                    </div>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mt-8 mb-4">3. Implement Resource Quotas</h3>
                <p className="text-gray-300 leading-relaxed mb-6">
                  Resource quotas at the namespace level prevent teams from consuming too many cluster resources. 
                  This is especially important in multi-tenant environments.
                </p>

                <h2 className="text-3xl font-bold text-white mt-12 mb-4">Monitoring and Optimization</h2>
                <p className="text-gray-300 leading-relaxed mb-6">
                  Regular monitoring is essential for effective resource management. Tools like Prometheus, Grafana, 
                  and the Kubernetes Metrics Server provide valuable insights into your cluster's resource utilization.
                </p>

                <ul className="space-y-3 my-8">
                  <li className="flex items-start gap-3 text-gray-300">
                    <span className="text-cyber-lime mt-1">✓</span>
                    <span>Track CPU and memory usage patterns over time</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <span className="text-cyber-lime mt-1">✓</span>
                    <span>Identify pods that are over or under-provisioned</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <span className="text-cyber-lime mt-1">✓</span>
                    <span>Set up alerts for resource threshold violations</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <span className="text-cyber-lime mt-1">✓</span>
                    <span>Review and adjust resource allocations quarterly</span>
                  </li>
                </ul>

                <h2 className="text-3xl font-bold text-white mt-12 mb-4">Conclusion</h2>
                <p className="text-gray-300 leading-relaxed mb-6">
                  Effective Kubernetes resource management is an ongoing process that requires monitoring, analysis, and 
                  continuous refinement. By following these best practices and regularly reviewing your cluster's resource 
                  utilization, you can ensure optimal performance and cost efficiency in your production environment.
                </p>

                <div className="rounded-2xl bg-gradient-cyber p-6 my-12">
                  <h3 className="text-xl font-bold text-white mb-3">Want to learn more?</h3>
                  <p className="text-white/90 mb-4">
                    Subscribe to our newsletter for weekly DevOps insights and best practices.
                  </p>
                  <div className="flex gap-3">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="flex-1 px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                    <button className="px-6 py-3 rounded-lg bg-white text-deep-charcoal font-semibold hover:bg-white/90 transition-colors">
                      Subscribe
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Actions (Desktop) */}
            <div className="hidden lg:block">
              <ArticleActions postId="1" title="Kubernetes Resource Management: Best Practices for Production" />
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="lg:hidden max-w-4xl mx-auto mt-8">
            <div className="flex items-center justify-center gap-4">
              <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                <span>❤️</span>
                <span className="font-semibold">42</span>
              </button>
              <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-electric-cyan hover:bg-electric-cyan/10 transition-all">
                🔖 Bookmark
              </button>
              <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-cyber-lime hover:bg-cyber-lime/10 transition-all">
                📤 Share
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="max-w-4xl mx-auto mt-16">
            <CommentsSection postId="1" />
          </div>
        </article>
      </main>
    </>
  )
}
