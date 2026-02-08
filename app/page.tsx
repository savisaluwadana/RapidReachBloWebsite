import Navbar from '@/components/Navbar'
import ArticleCard from '@/components/ArticleCard'
import LiveInfrastructureFeed from '@/components/LiveInfrastructureFeed'
import CodeSandbox from '@/components/CodeSandbox'
import HeroBentoGrid from '@/components/HeroBentoGrid'
import { TrendingUp, Zap, BookOpen, Users } from 'lucide-react'
import { getPosts } from '@/lib/actions/posts'

const sampleKubernetesYAML = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.24
        ports:
        - containerPort: 80
        resources:
          limits:
            memory: "256Mi"
            cpu: "500m"`

export default async function Home() {
  // Fetch featured post
  const featuredPosts = await getPosts({ featured: true, status: 'published', limit: 1 })
  const featuredArticle = featuredPosts[0]

  // Fetch recent articles
  const recentPosts = await getPosts({ status: 'published', limit: 6 })
  return (
    <main className="min-h-screen bg-deep-charcoal">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-mesh-gradient opacity-30" />
        <div className="absolute top-20 left-20 w-96 h-96 bg-electric-cyan/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyber-lime/10 rounded-full blur-3xl" />
        
        <div className="relative container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white via-electric-cyan to-cyber-lime bg-clip-text text-transparent">
                Master DevOps & Cloud Native
              </span>
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed">
              In-depth articles, tutorials, and insights on Kubernetes, Platform Engineering,
              and Cloud Native technologies. Written by practitioners, for practitioners.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { icon: BookOpen, value: '500+', label: 'Articles' },
              { icon: Users, value: '50K+', label: 'Readers' },
              { icon: TrendingUp, value: '1M+', label: 'Monthly Views' },
              { icon: Zap, value: '24/7', label: 'Live Updates' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10">
                <stat.icon className="w-8 h-8 text-electric-cyan mx-auto mb-3" />
                <div className="text-3xl font-bold gradient-text mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-gradient-dark">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Articles Column */}
            <div className="lg:col-span-2 space-y-12">
              {/* Featured Article */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Zap className="w-6 h-6 text-cyber-lime" />
                  Featured Article
                </h2>
                <ArticleCard {...featuredArticle} />
              </div>

              {/* Latest Articles */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-electric-cyan" />
                  Latest Articles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {articles.map((article, i) => (
                    <ArticleCard key={i} {...article} />
                  ))}
                </div>
              </div>

              {/* Code Example Section */}
              <div className="rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 p-8">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Learn by Example: Kubernetes Deployments
                </h2>
                <CodeSandbox
                  code={sampleKubernetesYAML}
                  language="yaml"
                  title="Production NGINX Deployment"
                  description="A production-ready configuration with 3 replicas and resource limits"
                  runnable={true}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Newsletter */}
              <div className="sticky top-24 space-y-6">
                <div className="rounded-2xl backdrop-blur-xl bg-gradient-cyber p-8 text-center">
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Join 50,000+ DevOps Professionals
                  </h3>
                  <p className="text-white/90 mb-6">
                    Get weekly insights on Kubernetes, Platform Engineering, and Cloud Native tech.
                  </p>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur-xl border border-white/30 text-white placeholder:text-white/60 mb-3 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <button className="w-full px-6 py-3 rounded-xl bg-white text-electric-cyan font-semibold hover:bg-white/90 transition-colors">
                    Subscribe Now
                  </button>
                </div>

                {/* Live Feed */}
                <div className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 h-[600px] overflow-hidden">
                  <LiveInfrastructureFeed />
                </div>

                {/* Popular Topics */}
                <div className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Popular Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Kubernetes', 'Terraform', 'GitOps', 'Docker', 'Istio', 'ArgoCD', 'AWS', 'Platform Engineering'].map((topic) => (
                      <button
                        key={topic}
                        className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-300 text-sm hover:bg-electric-cyan/20 hover:text-electric-cyan transition-colors"
                      >
                        #{topic}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 bg-deep-charcoal border-t border-white/10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold gradient-text mb-4">RapidReach</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Your trusted source for DevOps, Platform Engineering, and Cloud Native expertise.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Content</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-electric-cyan transition-colors cursor-pointer">All Articles</li>
                <li className="hover:text-electric-cyan transition-colors cursor-pointer">Learning Paths</li>
                <li className="hover:text-electric-cyan transition-colors cursor-pointer">News & Updates</li>
                <li className="hover:text-electric-cyan transition-colors cursor-pointer">Tutorials</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-electric-cyan transition-colors cursor-pointer">Documentation</li>
                <li className="hover:text-electric-cyan transition-colors cursor-pointer">Code Examples</li>
                <li className="hover:text-electric-cyan transition-colors cursor-pointer">Community</li>
                <li className="hover:text-electric-cyan transition-colors cursor-pointer">Newsletter</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-electric-cyan transition-colors cursor-pointer">About Us</li>
                <li className="hover:text-electric-cyan transition-colors cursor-pointer">Write for Us</li>
                <li className="hover:text-electric-cyan transition-colors cursor-pointer">Careers</li>
                <li className="hover:text-electric-cyan transition-colors cursor-pointer">Contact</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 text-center">
            <p className="text-gray-500 text-sm">
              © 2026 RapidReach. Made with ❤️ for the DevOps community.
            </p>
            <p className="text-gray-600 text-xs mt-2">
              Press <kbd className="px-2 py-1 rounded bg-white/10 text-gray-400 font-mono">⌘K</kbd> for quick navigation
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}

