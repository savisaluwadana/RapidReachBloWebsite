import Navbar from '@/components/Navbar'
import ArticleCard from '@/components/ArticleCard'
import LiveInfrastructureFeed from '@/components/LiveInfrastructureFeed'
import CodeSandbox from '@/components/CodeSandbox'
import Footer from '@/components/Footer'
import { BookOpen, Users, Award, Clock, ArrowRight, Zap, TrendingUp } from 'lucide-react'
import { getPosts, getSiteStats } from '@/lib/actions/posts'
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

/* ─── Learning Domains ─── */
const learningDomains = [
  {
    title: 'Container Orchestration',
    description: 'Container lifecycle, scaling, and management across distributed systems',
    icon: '⎈',
    gradient: 'from-[#326CE5] to-[#1E44A3]',
    tools: ['Kubernetes', 'Docker', 'Containerd', 'Podman'],
    href: '/blog?category=kubernetes',
    level: 'Beginner → Expert',
  },
  {
    title: 'Infrastructure as Code',
    description: 'Define and provision cloud infrastructure through declarative configuration',
    icon: '⟨/⟩',
    gradient: 'from-[#5C4EE5] to-[#4040B2]',
    tools: ['Terraform', 'Pulumi', 'CloudFormation', 'Crossplane'],
    href: '/blog?category=terraform',
    level: 'Intermediate',
  },
  {
    title: 'CI/CD & GitOps',
    description: 'Automate build, test, and deployment with Git as the source of truth',
    icon: '⟳',
    gradient: 'from-[#F97316] to-[#EA580C]',
    tools: ['ArgoCD', 'GitHub Actions', 'GitLab CI', 'Flux'],
    href: '/blog?category=cicd',
    level: 'Beginner → Advanced',
  },
  {
    title: 'Service Mesh & Networking',
    description: 'Secure, observe, and control traffic between microservices',
    icon: '◈',
    gradient: 'from-[#06B6D4] to-[#0891B2]',
    tools: ['Istio', 'Envoy', 'Cilium', 'Linkerd'],
    href: '/blog?category=service-mesh',
    level: 'Advanced',
  },
  {
    title: 'Cloud Platforms',
    description: 'Design, deploy, and operate applications across major cloud providers',
    icon: '☁',
    gradient: 'from-[#FF9900] to-[#E68A00]',
    tools: ['AWS', 'GCP', 'Azure', 'DigitalOcean'],
    href: '/blog?category=cloud',
    level: 'All Levels',
  },
  {
    title: 'Observability & SRE',
    description: 'Monitor, trace, and debug distributed systems at scale',
    icon: '◉',
    gradient: 'from-[#E11D48] to-[#BE123C]',
    tools: ['Prometheus', 'Grafana', 'Jaeger', 'OpenTelemetry'],
    href: '/blog?category=observability',
    level: 'Intermediate → Expert',
  },
  {
    title: 'Security & Compliance',
    description: 'Implement DevSecOps, supply chain security, and zero-trust',
    icon: '⛨',
    gradient: 'from-[#10B981] to-[#059669]',
    tools: ['Vault', 'Falco', 'OPA', 'Trivy'],
    href: '/blog?category=security',
    level: 'Intermediate → Advanced',
  },
  {
    title: 'Platform Engineering',
    description: 'Build Internal Developer Platforms that accelerate delivery',
    icon: '⬡',
    gradient: 'from-[#8B5CF6] to-[#7C3AED]',
    tools: ['Backstage', 'Port', 'Kratix', 'Score'],
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
    accent: '#326CE5',
    badge: 'Popular',
  },
  {
    title: 'GitOps Mastery with ArgoCD',
    steps: 8,
    duration: '4 weeks',
    level: 'Intermediate',
    accent: '#F97316',
    badge: 'New',
  },
  {
    title: 'Production-Grade IaC',
    steps: 10,
    duration: '5 weeks',
    level: 'Advanced',
    accent: '#5C4EE5',
    badge: 'Certified',
  },
]

export default async function Home() {
  const [featuredPosts, recentPosts, trendingPosts, siteStats] = await Promise.all([
    getPosts({ featured: true, status: 'published', limit: 1 }),
    getPosts({ status: 'published', limit: 6 }),
    getPosts({ trending: true, status: 'published', limit: 3 }),
    getSiteStats(),
  ])
  const featuredArticle = featuredPosts[0]

  return (
    <main className="min-h-screen bg-deep-charcoal">
      <Navbar />

      {/* ━━━━ HERO ━━━━ */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-40" />
        <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-electric-cyan/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#5C4EE5]/[0.04] rounded-full blur-[120px]" />

        <div className="relative container mx-auto px-6">
          {/* Status badge */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06]">
              <span className="flex h-1.5 w-1.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-lime opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyber-lime" />
              </span>
              <span className="text-xs text-gray-400">Live DevOps &amp; Platform Engineering Content</span>
            </div>
          </div>

          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-[1.1] tracking-tight">
              <span className="text-white">Learn </span>
              <span className="bg-gradient-to-r from-electric-cyan to-[#5C4EE5] bg-clip-text text-transparent">DevOps</span>
              <br />
              <span className="text-white">the </span>
              <span className="bg-gradient-to-r from-cyber-lime to-electric-cyan bg-clip-text text-transparent">modern way</span>
            </h1>
            <p className="text-base md:text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto mb-10">
              From Container Orchestration to Platform Engineering — master the concepts,
              tools, and practices that power today&apos;s cloud-native infrastructure.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-14">
              <Link
                href="/learning-paths"
                className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-electric-cyan text-white text-sm font-medium hover:bg-electric-cyan/90 transition-colors"
              >
                Start Learning
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-gray-300 text-sm font-medium hover:bg-white/[0.06] transition-colors"
              >
                Browse Articles
              </Link>
            </div>

            {/* Real stats */}
            <div className="flex flex-wrap justify-center gap-10 md:gap-16">
              {[
                { icon: <BookOpen className="w-4 h-4" />, value: String(siteStats.totalPosts), label: 'Articles' },
                { icon: <Users className="w-4 h-4" />, value: String(siteStats.totalUsers), label: 'Users' },
                { icon: <Award className="w-4 h-4" />, value: '8', label: 'Domains' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-0.5">
                    <span className="text-gray-600">{stat.icon}</span>
                    <span className="text-xl font-bold text-white tabular-nums">{stat.value}</span>
                  </div>
                  <span className="text-[10px] text-gray-600 uppercase tracking-widest">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━ LEARNING DOMAINS ━━━━ */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs text-electric-cyan uppercase tracking-widest font-medium mb-3">Learning Domains</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Master the concepts,{' '}
              <span className="bg-gradient-to-r from-electric-cyan to-cyber-lime bg-clip-text text-transparent">not just the tools</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm">
              We organize learning around core DevOps domains — concepts, best practices, and tools to become production-ready.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {learningDomains.map((domain) => (
              <Link
                key={domain.title}
                href={domain.href}
                className="group relative rounded-xl bg-white/[0.02] border border-white/[0.04] p-5 hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300"
              >
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${domain.gradient} flex items-center justify-center text-white text-lg`}>
                      {domain.icon}
                    </div>
                    <span className="text-[9px] font-medium uppercase tracking-wider text-gray-600 bg-white/[0.03] px-1.5 py-0.5 rounded">
                      {domain.level}
                    </span>
                  </div>

                  <h3 className="text-white font-semibold text-sm mb-1.5 group-hover:text-electric-cyan transition-colors">
                    {domain.title}
                  </h3>
                  <p className="text-gray-600 text-xs leading-relaxed mb-3 line-clamp-2">
                    {domain.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {domain.tools.map((tool) => (
                      <span
                        key={tool}
                        className="px-1.5 py-0.5 rounded bg-white/[0.03] text-gray-500 text-[10px] font-medium"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.03]">
                    <span className="text-[11px] text-gray-600">
                      <span className="text-gray-400 font-medium">{siteStats.domainCounts[domain.title] || 0}</span> articles
                    </span>
                    <span className="text-[11px] text-electric-cyan opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                      Explore <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━ LEARNING PATHS ━━━━ */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-deep-charcoal-100/20 to-transparent" />
        <div className="relative container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 gap-4">
            <div>
              <p className="text-xs text-cyber-lime uppercase tracking-widest font-medium mb-3">Structured Learning</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white">Guided Learning Paths</h2>
              <p className="text-gray-500 mt-2 max-w-lg text-sm">
                Step-by-step paths from beginner to expert, with hands-on projects and real-world scenarios.
              </p>
            </div>
            <Link
              href="/learning-paths"
              className="text-sm text-electric-cyan font-medium flex items-center gap-1.5 hover:gap-2.5 transition-all shrink-0"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {featuredPaths.map((path) => (
              <Link
                key={path.title}
                href="/learning-paths"
                className="group relative rounded-xl bg-white/[0.02] border border-white/[0.04] p-5 hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300 overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${path.accent}40, transparent)` }} />

                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded" style={{ color: path.accent, backgroundColor: `${path.accent}15` }}>
                    {path.badge}
                  </span>
                  <span className="text-[10px] text-gray-600">{path.level}</span>
                </div>

                <h3 className="text-white font-semibold text-base mb-3 group-hover:text-electric-cyan transition-colors">{path.title}</h3>

                <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    {path.steps} modules
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {path.duration}
                  </span>
                </div>

                <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
                  <div className="h-full rounded-full w-0" style={{ background: `linear-gradient(90deg, ${path.accent}, ${path.accent}80)` }} />
                </div>
                <p className="text-[11px] text-gray-600 mt-2 flex items-center gap-1">
                  Start this path <ArrowRight className="w-3 h-3" />
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━ MAIN CONTENT ━━━━ */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Articles Column */}
            <div className="lg:col-span-2 space-y-10">
              {featuredArticle && (
                <div>
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-cyber-lime" />
                    Featured
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
                    readTime={`${featuredArticle.estimated_read_time || 5} min`}
                    date={new Date(featuredArticle.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    image={featuredArticle.cover_image_url || ''}
                    slug={featuredArticle.slug}
                    featured={featuredArticle.featured}
                    trending={featuredArticle.trending}
                  />
                </div>
              )}

              <div>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-electric-cyan" />
                  Latest Articles
                </h2>
                {recentPosts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        readTime={`${article.estimated_read_time || 5} min`}
                        date={new Date(article.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        image={article.cover_image_url || ''}
                        slug={article.slug}
                        trending={article.trending}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-10 text-center">
                    <BookOpen className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                    <h3 className="text-base font-semibold text-white mb-1">No Articles Yet</h3>
                    <p className="text-sm text-gray-500">Articles will appear here once published.</p>
                  </div>
                )}
              </div>

              {trendingPosts.length > 0 && (
                <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-6">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-electric-cyan" />
                    Trending This Week
                  </h2>
                  <div className="space-y-2">
                    {trendingPosts.map((post, index) => (
                      <Link
                        key={post.id}
                        href={`/blog/${post.slug}`}
                        className="flex gap-3 p-3 rounded-lg hover:bg-white/[0.03] transition-colors group"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-md bg-white/[0.04] flex items-center justify-center text-gray-500 font-mono text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors line-clamp-2 mb-0.5">
                            {post.title}
                          </h3>
                          <div className="flex items-center gap-2 text-[11px] text-gray-600">
                            <span>{post.author?.full_name || 'Anonymous'}</span>
                            <span>·</span>
                            <span>{post.view_count} views</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Learn by Example</h2>
                <CodeSandbox
                  code={sampleKubernetesYAML}
                  language="yaml"
                  title="Kubernetes Deployment"
                  description="A production-ready NGINX deployment with replicas and resource limits"
                  runnable={true}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 space-y-4">
                <div className="rounded-xl bg-gradient-to-br from-electric-cyan/90 to-[#5C4EE5]/90 p-6 relative overflow-hidden">
                  <div className="absolute inset-0 dot-grid opacity-10" />
                  <div className="relative z-10">
                    <h3 className="text-lg font-bold text-white mb-1.5">Level Up Weekly</h3>
                    <p className="text-white/70 mb-4 text-xs leading-relaxed">
                      Curated DevOps insights, tutorials, and news — every week.
                    </p>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      className="w-full px-3 py-2.5 rounded-lg bg-white/15 border border-white/20 text-sm text-white placeholder:text-white/40 mb-2 focus:outline-none focus:ring-1 focus:ring-white/40"
                    />
                    <button className="w-full px-4 py-2.5 rounded-lg bg-white text-electric-cyan text-sm font-semibold hover:bg-white/90 transition-colors">
                      Subscribe Free
                    </button>
                    <p className="text-white/40 text-[10px] mt-2 text-center">No spam. Unsubscribe anytime.</p>
                  </div>
                </div>

                <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] h-[520px] overflow-hidden">
                  <LiveInfrastructureFeed />
                </div>

                <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5">
                  <h3 className="text-sm font-semibold text-white mb-3">Popular Topics</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Kubernetes', 'Terraform', 'GitOps', 'Docker', 'Istio', 'ArgoCD',
                      'AWS', 'Platform Engineering', 'Prometheus', 'Helm', 'CI/CD', 'SRE',
                    ].map((topic) => (
                      <Link
                        key={topic}
                        href={`/blog?category=${encodeURIComponent(topic.toLowerCase())}`}
                        className="px-2 py-1 rounded-md bg-white/[0.03] text-gray-500 text-xs hover:bg-electric-cyan/10 hover:text-electric-cyan transition-colors"
                      >
                        {topic}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━ WHY RAPIDREACH ━━━━ */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs text-[#5C4EE5] uppercase tracking-widest font-medium mb-3">Why RapidReach</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Built for engineers who{' '}
              <span className="bg-gradient-to-r from-[#5C4EE5] to-electric-cyan bg-clip-text text-transparent">ship to production</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-4xl mx-auto">
            {[
              {
                icon: '🏗️',
                title: 'Concept-First Learning',
                description: 'Understand the WHY before the HOW. Patterns and architectures, not just tool-specific commands.',
              },
              {
                icon: '🔬',
                title: 'Production Scenarios',
                description: 'Real-world configs, failure modes, and battle-tested best practices from production environments.',
              },
              {
                icon: '🗺️',
                title: 'Guided Progression',
                description: 'Structured paths from fundamentals to advanced topics with clear milestones and hands-on projects.',
              },
            ].map((feature) => (
              <div key={feature.title} className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-6 hover:bg-white/[0.04] transition-colors">
                <div className="text-2xl mb-3">{feature.icon}</div>
                <h3 className="text-white font-semibold text-sm mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━ CTA ━━━━ */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-electric-cyan/[0.04] rounded-full blur-[100px]" />

        <div className="relative container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Your DevOps journey{' '}
              <span className="bg-gradient-to-r from-electric-cyan to-cyber-lime bg-clip-text text-transparent">starts here</span>
            </h2>
            <p className="text-base text-gray-500 mb-8 max-w-xl mx-auto">
              Master Container Orchestration, Infrastructure as Code, GitOps, and Platform Engineering with practitioner-written content.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-electric-cyan text-white text-sm font-medium hover:bg-electric-cyan/90 transition-colors"
              >
                Get Started Free
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-gray-300 text-sm font-medium hover:bg-white/[0.06] transition-colors"
              >
                Browse Articles
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
