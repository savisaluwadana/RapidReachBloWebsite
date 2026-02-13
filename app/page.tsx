import Navbar from '@/components/Navbar'
import ArticleCard from '@/components/ArticleCard'
import LiveInfrastructureFeed from '@/components/LiveInfrastructureFeed'
import CodeSandbox from '@/components/CodeSandbox'
import Footer from '@/components/Footer'
import { TrendingUp, Zap, BookOpen, Users, Award, Clock, Star } from 'lucide-react'
import { getPosts } from '@/lib/actions/posts'
import Link from 'next/link'

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

/* ─── Learning Domains Data ─── */
const learningDomains = [
  {
    title: 'Container Orchestration',
    description: 'Master container lifecycle, scaling, and management across distributed systems',
    icon: '⎈',
    color: 'from-[#326CE5] to-[#1E44A3]',
    glow: 'rgba(50,108,229,0.35)',
    tools: ['Kubernetes', 'Docker', 'Containerd', 'Podman'],
    articles: 42,
    href: '/blog?category=kubernetes',
    level: 'Beginner → Expert',
  },
  {
    title: 'Infrastructure as Code',
    description: 'Define, provision, and manage cloud infrastructure through declarative configuration',
    icon: '⟨/⟩',
    color: 'from-[#5C4EE5] to-[#4040B2]',
    glow: 'rgba(92,78,229,0.35)',
    tools: ['Terraform', 'Pulumi', 'CloudFormation', 'Crossplane'],
    articles: 38,
    href: '/blog?category=terraform',
    level: 'Intermediate',
  },
  {
    title: 'CI/CD & GitOps',
    description: 'Automate build, test, and deployment pipelines with Git as the single source of truth',
    icon: '⟳',
    color: 'from-[#F97316] to-[#EA580C]',
    glow: 'rgba(249,115,22,0.35)',
    tools: ['ArgoCD', 'GitHub Actions', 'GitLab CI', 'Flux'],
    articles: 35,
    href: '/blog?category=cicd',
    level: 'Beginner → Advanced',
  },
  {
    title: 'Service Mesh & Networking',
    description: 'Secure, observe, and control traffic between microservices with zero-trust networking',
    icon: '◈',
    color: 'from-[#06B6D4] to-[#0891B2]',
    glow: 'rgba(6,182,212,0.35)',
    tools: ['Istio', 'Envoy', 'Cilium', 'Linkerd'],
    articles: 28,
    href: '/blog?category=service-mesh',
    level: 'Advanced',
  },
  {
    title: 'Cloud Platforms',
    description: 'Design, deploy, and operate applications across major cloud providers',
    icon: '☁',
    color: 'from-[#FF9900] to-[#E68A00]',
    glow: 'rgba(255,153,0,0.35)',
    tools: ['AWS', 'GCP', 'Azure', 'DigitalOcean'],
    articles: 56,
    href: '/blog?category=cloud',
    level: 'All Levels',
  },
  {
    title: 'Observability & SRE',
    description: 'Monitor, trace, and debug distributed systems with modern observability stacks',
    icon: '◉',
    color: 'from-[#E11D48] to-[#BE123C]',
    glow: 'rgba(225,29,72,0.35)',
    tools: ['Prometheus', 'Grafana', 'Jaeger', 'OpenTelemetry'],
    articles: 31,
    href: '/blog?category=observability',
    level: 'Intermediate → Expert',
  },
  {
    title: 'Security & Compliance',
    description: 'Implement DevSecOps, supply chain security, and zero-trust architectures',
    icon: '⛨',
    color: 'from-[#10B981] to-[#059669]',
    glow: 'rgba(16,185,129,0.35)',
    tools: ['Vault', 'Falco', 'OPA', 'Trivy'],
    articles: 24,
    href: '/blog?category=security',
    level: 'Intermediate → Advanced',
  },
  {
    title: 'Platform Engineering',
    description: 'Build Internal Developer Platforms that accelerate delivery and reduce cognitive load',
    icon: '⬡',
    color: 'from-[#8B5CF6] to-[#7C3AED]',
    glow: 'rgba(139,92,246,0.35)',
    tools: ['Backstage', 'Port', 'Kratix', 'Score'],
    articles: 19,
    href: '/blog?category=platform-engineering',
    level: 'Advanced',
  },
]

/* ─── Featured Learning Paths ─── */
const featuredPaths = [
  {
    title: 'Kubernetes Zero to Hero',
    steps: 12,
    duration: '6 weeks',
    level: 'Beginner',
    color: 'from-[#326CE5]/20 to-[#326CE5]/5',
    border: 'border-[#326CE5]/30',
    badge: '🔥 Most Popular',
  },
  {
    title: 'GitOps Mastery with ArgoCD',
    steps: 8,
    duration: '4 weeks',
    level: 'Intermediate',
    color: 'from-[#F97316]/20 to-[#F97316]/5',
    border: 'border-[#F97316]/30',
    badge: '⭐ New',
  },
  {
    title: 'Production-Grade IaC',
    steps: 10,
    duration: '5 weeks',
    level: 'Advanced',
    color: 'from-[#5C4EE5]/20 to-[#5C4EE5]/5',
    border: 'border-[#5C4EE5]/30',
    badge: '🏆 Certified',
  },
]

export default async function Home() {
  const featuredPosts = await getPosts({ featured: true, status: 'published', limit: 1 })
  const featuredArticle = featuredPosts[0]
  const recentPosts = await getPosts({ status: 'published', limit: 6 })
  const trendingPosts = await getPosts({ trending: true, status: 'published', limit: 3 })

  return (
    <main className="min-h-screen bg-deep-charcoal">
      <Navbar />

      {/* ━━━━━━━━━━━━ HERO ━━━━━━━━━━━━ */}
      <section className="relative pt-20 pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-mesh-gradient opacity-30" />
        <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-electric-cyan/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-cyber-lime/8 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#5C4EE5]/5 rounded-full blur-[140px]" />

        <div className="relative container mx-auto px-6">
          {/* Trust Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-lime opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-lime" />
              </span>
              <span className="text-sm text-gray-300">Trusted by <span className="text-white font-semibold">12,000+</span> DevOps engineers worldwide</span>
            </div>
          </div>

          <div className="max-w-5xl mx-auto text-center mb-16">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-[1.05] tracking-tight">
              <span className="text-white">Learn </span>
              <span className="bg-gradient-to-r from-electric-cyan via-[#5C4EE5] to-cyber-lime bg-clip-text text-transparent">
                DevOps
              </span>
              <br />
              <span className="text-white">The </span>
              <span className="bg-gradient-to-r from-cyber-lime to-electric-cyan bg-clip-text text-transparent">
                Modern Way
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 leading-relaxed max-w-3xl mx-auto mb-10">
              From Container Orchestration to Platform Engineering — master the concepts, tools,
              and practices that power today&apos;s cloud-native infrastructure. Hands-on learning paths
              built by practitioners.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/learning-paths"
                className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-electric-cyan to-[#5C4EE5] text-white font-semibold text-lg shadow-[0_0_30px_rgba(50,108,229,0.4)] hover:shadow-[0_0_50px_rgba(50,108,229,0.6)] transition-all hover:scale-[1.03] flex items-center justify-center gap-2"
              >
                Start Learning Free
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </Link>
              <Link
                href="/blog"
                className="px-8 py-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 text-white font-semibold text-lg hover:bg-white/10 transition-all"
              >
                Explore Articles
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-8 md:gap-14">
              {[
                { icon: <BookOpen className="w-5 h-5" />, value: '200+', label: 'In-Depth Articles' },
                { icon: <Users className="w-5 h-5" />, value: '12K+', label: 'Engineers Learning' },
                { icon: <Award className="w-5 h-5" />, value: '8', label: 'Learning Domains' },
                { icon: <Clock className="w-5 h-5" />, value: '150h+', label: 'Content Hours' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-electric-cyan">{stat.icon}</span>
                    <span className="text-2xl font-bold text-white">{stat.value}</span>
                  </div>
                  <span className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━ LEARNING DOMAINS ━━━━━━━━━━━━ */}
      <section className="py-20 bg-deep-charcoal relative">
        <div className="absolute inset-0 bg-gradient-to-b from-deep-charcoal via-deep-charcoal-100/50 to-deep-charcoal" />
        <div className="relative container mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-electric-cyan/10 border border-electric-cyan/20 text-electric-cyan text-sm font-medium mb-4">
              Learning Domains
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Master the Concepts,<br />
              <span className="bg-gradient-to-r from-electric-cyan to-cyber-lime bg-clip-text text-transparent">
                Not Just the Tools
              </span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              We organize learning around core DevOps domains. Each domain covers the concepts, best practices, and tools you need to become production-ready.
            </p>
          </div>

          {/* Domain Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
            {learningDomains.map((domain) => (
              <Link
                key={domain.title}
                href={domain.href}
                className="group relative rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6 hover:bg-white/[0.06] transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1"
              >
                {/* Hover glow */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ boxShadow: `inset 0 1px 0 0 rgba(255,255,255,0.06), 0 0 40px ${domain.glow}` }}
                />

                <div className="relative z-10">
                  {/* Icon + Level */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${domain.color} flex items-center justify-center text-white text-xl shadow-lg`}>
                      {domain.icon}
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 bg-white/5 px-2 py-1 rounded-md">
                      {domain.level}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-white font-bold text-lg mb-2 group-hover:text-electric-cyan transition-colors">
                    {domain.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
                    {domain.description}
                  </p>

                  {/* Tools Row */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {domain.tools.map((tool) => (
                      <span
                        key={tool}
                        className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-gray-400 text-xs font-medium"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                    <span className="text-xs text-gray-500">
                      <span className="text-white font-semibold">{domain.articles}</span> articles
                    </span>
                    <span className="text-xs text-electric-cyan opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      Explore
                      <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━ LEARNING PATHS ━━━━━━━━━━━━ */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-deep-charcoal to-deep-charcoal-100/30" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#5C4EE5]/5 rounded-full blur-[140px]" />

        <div className="relative container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-cyber-lime/10 border border-cyber-lime/20 text-cyber-lime text-sm font-medium mb-4">
                Structured Learning
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-white">
                Guided Learning Paths
              </h2>
              <p className="text-gray-400 mt-3 max-w-xl">
                Follow curated, step-by-step paths from beginner to expert. Each path includes hands-on projects, assessments, and real-world scenarios.
              </p>
            </div>
            <Link
              href="/learning-paths"
              className="text-electric-cyan font-semibold flex items-center gap-2 hover:gap-3 transition-all shrink-0"
            >
              View All Paths
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {featuredPaths.map((path) => (
              <Link
                key={path.title}
                href="/learning-paths"
                className={`group relative rounded-2xl bg-gradient-to-br ${path.color} border ${path.border} p-6 hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold bg-white/10 text-white px-2.5 py-1 rounded-full">
                    {path.badge}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">{path.level}</span>
                </div>

                <h3 className="text-white font-bold text-xl mb-3">{path.title}</h3>

                <div className="flex items-center gap-4 text-sm text-gray-400 mb-5">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    {path.steps} modules
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {path.duration}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-electric-cyan to-cyber-lime rounded-full w-0" />
                </div>
                <p className="text-xs text-gray-500 mt-2">Start this path →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━ MAIN CONTENT ━━━━━━━━━━━━ */}
      <section className="py-16 bg-gradient-dark">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Articles Column */}
            <div className="lg:col-span-2 space-y-12">
              {/* Featured Article */}
              {featuredArticle && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <Zap className="w-6 h-6 text-cyber-lime" />
                    Featured Article
                  </h2>
                  <ArticleCard
                    title={featuredArticle.title}
                    excerpt={featuredArticle.excerpt}
                    author={{
                      name: featuredArticle.author?.full_name || 'Anonymous',
                      avatar: featuredArticle.author?.avatar_url || '',
                      role: featuredArticle.author?.role || 'Contributor',
                    }}
                    category={featuredArticle.category}
                    readTime={`${featuredArticle.estimated_read_time || 5} min read`}
                    date={new Date(featuredArticle.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    image={featuredArticle.cover_image_url || ''}
                    slug={featuredArticle.slug}
                    featured={featuredArticle.featured}
                    trending={featuredArticle.trending}
                  />
                </div>
              )}

              {/* Latest Articles */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-electric-cyan" />
                  Latest Articles
                </h2>
                {recentPosts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {recentPosts.map((article) => (
                      <ArticleCard
                        key={article.id}
                        title={article.title}
                        excerpt={article.excerpt}
                        author={{
                          name: article.author?.full_name || 'Anonymous',
                          avatar: article.author?.avatar_url || '',
                          role: article.author?.role || 'Contributor',
                        }}
                        category={article.category}
                        readTime={`${article.estimated_read_time || 5} min read`}
                        date={new Date(article.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        image={article.cover_image_url || ''}
                        slug={article.slug}
                        trending={article.trending}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-12 text-center">
                    <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Articles Yet</h3>
                    <p className="text-gray-400 mb-4">Check back soon for exciting DevOps content!</p>
                    <p className="text-sm text-electric-cyan">💡 Configure Supabase to load real posts (see SETUP_GUIDE.md)</p>
                  </div>
                )}
              </div>

              {/* Trending This Week */}
              {trendingPosts.length > 0 && (
                <div className="rounded-3xl backdrop-blur-xl bg-gradient-to-br from-electric-cyan/10 to-cyber-lime/10 border border-electric-cyan/20 p-8">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-electric-cyan" />
                    Trending This Week
                  </h2>
                  <div className="space-y-4">
                    {trendingPosts.map((post, index) => (
                      <Link
                        key={post.id}
                        href={`/blog/${post.slug}`}
                        className="flex gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all group"
                      >
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-cyber flex items-center justify-center text-white font-bold text-xl">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-white group-hover:text-electric-cyan transition-colors line-clamp-2 mb-1">
                            {post.title}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span>{post.author?.full_name || 'Anonymous'}</span>
                            <span>•</span>
                            <span>{post.view_count} views</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

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
              <div className="sticky top-24 space-y-6">
                {/* Newsletter CTA */}
                <div className="rounded-2xl bg-gradient-to-br from-electric-cyan/90 to-[#5C4EE5]/90 p-8 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url(&apos;data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvc3ZnPg==&apos;)] opacity-50" />
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold text-white mb-3">
                      Level Up Weekly
                    </h3>
                    <p className="text-white/80 mb-6 text-sm">
                      Join 12,000+ engineers getting curated DevOps insights, tutorials, and industry news every week.
                    </p>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur-xl border border-white/30 text-white placeholder:text-white/50 mb-3 focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                    <button className="w-full px-6 py-3 rounded-xl bg-white text-electric-cyan font-semibold hover:bg-white/90 transition-colors shadow-lg">
                      Subscribe — It&apos;s Free
                    </button>
                    <p className="text-white/50 text-xs mt-3">No spam. Unsubscribe anytime.</p>
                  </div>
                </div>

                {/* Live Feed */}
                <div className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 h-[600px] overflow-hidden">
                  <LiveInfrastructureFeed />
                </div>

                {/* Popular Topics */}
                <div className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Popular Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Kubernetes', 'Terraform', 'GitOps', 'Docker', 'Istio', 'ArgoCD',
                      'AWS', 'Platform Engineering', 'Prometheus', 'Helm', 'CI/CD', 'SRE',
                    ].map((topic) => (
                      <Link
                        key={topic}
                        href={`/blog?category=${encodeURIComponent(topic.toLowerCase())}`}
                        className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-300 text-sm hover:bg-electric-cyan/20 hover:text-electric-cyan transition-colors border border-white/[0.04]"
                      >
                        #{topic}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━ WHY RAPIDREACH ━━━━━━━━━━━━ */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-deep-charcoal-100/30 to-deep-charcoal" />
        <div className="relative container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#5C4EE5]/10 border border-[#5C4EE5]/20 text-[#5C4EE5] text-sm font-medium mb-4">
              Why RapidReach
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Built for Engineers Who<br />
              <span className="bg-gradient-to-r from-[#5C4EE5] to-electric-cyan bg-clip-text text-transparent">
                Ship to Production
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: '🏗️',
                title: 'Concept-First Learning',
                description: 'Understand the WHY before the HOW. We teach patterns and architectures, not just tool-specific commands.',
              },
              {
                icon: '🔬',
                title: 'Production Scenarios',
                description: 'Every article includes real-world configs, failure modes, and battle-tested best practices from production environments.',
              },
              {
                icon: '🗺️',
                title: 'Guided Progression',
                description: 'Structured learning paths take you from fundamentals to advanced topics with clear milestones and hands-on projects.',
              },
            ].map((feature) => (
              <div key={feature.title} className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-8 text-center hover:bg-white/[0.05] transition-all">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-white font-bold text-xl mb-3">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━ CTA ━━━━━━━━━━━━ */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-electric-cyan/10 via-[#5C4EE5]/10 to-cyber-lime/10" />
        <div className="absolute inset-0 bg-mesh-gradient opacity-20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-electric-cyan/5 rounded-full blur-[120px]" />
        
        <div className="relative container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Your DevOps Journey<br />
              <span className="bg-gradient-to-r from-electric-cyan to-cyber-lime bg-clip-text text-transparent">
                Starts Here
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-10 leading-relaxed max-w-2xl mx-auto">
              Join thousands of engineers mastering Container Orchestration, Infrastructure as Code, GitOps, and Platform Engineering.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <Link
                href="/auth/signup"
                className="px-10 py-4 rounded-2xl bg-gradient-to-r from-electric-cyan to-[#5C4EE5] text-white font-semibold text-lg shadow-[0_0_40px_rgba(50,108,229,0.4)] hover:shadow-[0_0_60px_rgba(50,108,229,0.6)] transition-all hover:scale-[1.03]"
              >
                Get Started Free
              </Link>
              <Link
                href="/blog"
                className="px-10 py-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white font-semibold text-lg hover:bg-white/20 transition-all"
              >
                Browse Articles
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center gap-2">
              <div className="flex -space-x-2">
                {['A', 'B', 'C', 'D', 'E'].map((letter, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-electric-cyan to-[#5C4EE5] border-2 border-deep-charcoal flex items-center justify-center"
                  >
                    <span className="text-white text-xs font-bold">{letter}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1 ml-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-gray-400 text-sm ml-2">Loved by 12,000+ engineers</span>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
