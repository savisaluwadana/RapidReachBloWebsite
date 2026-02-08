import HeroBentoGrid from '@/components/HeroBentoGrid'
import LiveInfrastructureFeed from '@/components/LiveInfrastructureFeed'
import CodeSandbox from '@/components/CodeSandbox'

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
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  selector:
    app: nginx
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer`

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section with Bento Grid */}
      <HeroBentoGrid />

      {/* Content Section */}
      <section className="relative py-20 bg-gradient-dark">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-12">
              {/* Featured Article Preview */}
              <div className="bento-card p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 rounded-full bg-electric-cyan/20 text-electric-cyan text-xs font-semibold">
                    FEATURED
                  </span>
                  <span className="text-gray-500 text-sm">5 min read</span>
                </div>
                <h2 className="text-3xl font-bold mb-4 text-white hover:text-electric-cyan transition-colors cursor-pointer">
                  Building Production-Ready Kubernetes Clusters with GitOps
                </h2>
                <p className="text-gray-400 leading-relaxed mb-6">
                  Learn how to implement GitOps workflows using ArgoCD and Flux to manage Kubernetes 
                  deployments at scale. We'll cover best practices, security considerations, and 
                  real-world examples from production environments.
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                    alt="Author"
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="font-semibold text-white">Sarah Chen</div>
                    <div className="text-sm text-gray-500">Platform Engineering Lead @ CloudNative Co</div>
                  </div>
                </div>
              </div>

              {/* Interactive Code Example */}
              <div className="bento-card p-8">
                <h2 className="text-2xl font-bold mb-6 text-white">
                  Interactive Kubernetes Deployment
                </h2>
                <CodeSandbox
                  code={sampleKubernetesYAML}
                  language="yaml"
                  title="NGINX Deployment with LoadBalancer"
                  description="A production-ready NGINX deployment with 3 replicas and resource limits"
                  runnable={true}
                />
              </div>

              {/* Latest Articles Grid */}
              <div>
                <h2 className="text-2xl font-bold mb-6 text-white">Latest Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      title: 'Terraform State Management Best Practices',
                      category: 'Infrastructure as Code',
                      readTime: '8 min',
                      color: 'cyber-lime',
                    },
                    {
                      title: 'Observability Stack: Prometheus + Grafana + Loki',
                      category: 'Monitoring',
                      readTime: '12 min',
                      color: 'electric-cyan',
                    },
                    {
                      title: 'Zero-Trust Security in Kubernetes',
                      category: 'Security',
                      readTime: '10 min',
                      color: 'cyber-lime',
                    },
                    {
                      title: 'Building Internal Developer Platforms',
                      category: 'Platform Engineering',
                      readTime: '15 min',
                      color: 'electric-cyan',
                    },
                  ].map((article, i) => (
                    <div
                      key={i}
                      className="bento-card p-6 cursor-pointer group"
                    >
                      <div className={`w-full h-32 rounded-xl bg-gradient-to-br from-${article.color}/20 to-transparent mb-4`} />
                      <span className={`text-${article.color} text-xs font-semibold uppercase tracking-wider`}>
                        {article.category}
                      </span>
                      <h3 className="text-lg font-bold text-white group-hover:text-electric-cyan transition-colors mt-2 mb-3">
                        {article.title}
                      </h3>
                      <p className="text-gray-500 text-sm">{article.readTime} read</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar - Live Feed */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 bento-card h-[800px] overflow-hidden">
                <LiveInfrastructureFeed />
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
              <p className="text-gray-400 text-sm">
                Your gateway to DevOps and Cloud Native excellence.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Content</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-electric-cyan transition-colors cursor-pointer">Articles</li>
                <li className="hover:text-electric-cyan transition-colors cursor-pointer">Learning Paths</li>
                <li className="hover:text-electric-cyan transition-colors cursor-pointer">News Feed</li>
                <li className="hover:text-electric-cyan transition-colors cursor-pointer">Tutorials</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-electric-cyan transition-colors cursor-pointer">Documentation</li>
                <li className="hover:text-electric-cyan transition-colors cursor-pointer">API Reference</li>
                <li className="hover:text-electric-cyan transition-colors cursor-pointer">Community</li>
                <li className="hover:text-electric-cyan transition-colors cursor-pointer">Newsletter</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-electric-cyan transition-colors cursor-pointer">About</li>
                <li className="hover:text-electric-cyan transition-colors cursor-pointer">Blog</li>
                <li className="hover:text-electric-cyan transition-colors cursor-pointer">Careers</li>
                <li className="hover:text-electric-cyan transition-colors cursor-pointer">Contact</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 text-center text-gray-500 text-sm">
            <p>© 2026 RapidReach. Built with Next.js & Supabase.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}

