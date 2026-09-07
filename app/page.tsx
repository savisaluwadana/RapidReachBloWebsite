import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  Boxes,
  Cloud,
  Code2,
  Gauge,
  GitBranch,
  Layers3,
  LockKeyhole,
  Network,
  Radar,
  Sparkles,
  TerminalSquare,
  Users,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getPosts, getSiteStats } from '@/lib/actions/posts'

const domains = [
  {
    title: 'Kubernetes & Containers',
    description: 'Go beyond kubectl. Understand scheduling, networking, workloads, debugging, and production operations.',
    href: '/category/kubernetes',
    icon: Boxes,
    eyebrow: 'Orchestration',
  },
  {
    title: 'Platform Engineering',
    description: 'Build internal platforms, golden paths, developer portals, and paved roads that teams actually use.',
    href: '/category/platform-engineering',
    icon: Layers3,
    eyebrow: 'Developer experience',
  },
  {
    title: 'GitOps & Delivery',
    description: 'Design safer delivery systems with GitOps, progressive delivery, CI/CD, and release engineering.',
    href: '/category/cicd',
    icon: GitBranch,
    eyebrow: 'Software delivery',
  },
  {
    title: 'Cloud Infrastructure',
    description: 'Reason about cloud architecture, IaC, reliability, cost, and the trade-offs behind production systems.',
    href: '/category/cloud',
    icon: Cloud,
    eyebrow: 'Infrastructure',
  },
  {
    title: 'Observability & SRE',
    description: 'Learn how to measure systems, debug incidents, design SLOs, and operate services with confidence.',
    href: '/category/observability',
    icon: Gauge,
    eyebrow: 'Reliability',
  },
  {
    title: 'Cloud Native Security',
    description: 'Understand workload security, policy, secrets, supply-chain controls, and practical DevSecOps.',
    href: '/category/security',
    icon: LockKeyhole,
    eyebrow: 'Security',
  },
]

const productPrinciples = [
  {
    icon: Radar,
    title: 'Signal over noise',
    description: 'We turn fast-moving cloud-native changes into the few ideas, patterns, and trade-offs worth knowing.',
  },
  {
    icon: TerminalSquare,
    title: 'Built for practitioners',
    description: 'Content is structured around real engineering decisions—not keyword stuffing, shallow summaries, or certification trivia.',
  },
  {
    icon: Network,
    title: 'Learn systems, not products',
    description: 'Vendor tools change. The underlying architecture, failure modes, and operating principles compound for years.',
  },
]

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export default async function Home() {
  const [siteStats, latestPosts] = await Promise.all([
    getSiteStats(),
    getPosts({ status: 'published', limit: 6 }),
  ])

  return (
    <main className="min-h-screen bg-deep-charcoal text-white">
      <Navbar />

      <section className="relative isolate overflow-hidden border-b border-white/[0.05]">
        <div className="premium-grid absolute inset-0 -z-20" />
        <div className="absolute inset-x-0 top-0 -z-10 mx-auto h-[620px] max-w-6xl premium-hero-glow" />

        <div className="container mx-auto px-6 pb-20 pt-20 md:pb-28 md:pt-28">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 flex flex-wrap items-center gap-3">
              <div className="premium-kicker">
                <span className="h-1.5 w-1.5 rounded-full bg-cyber-lime shadow-[0_0_14px_rgba(0,255,136,0.85)]" />
                Engineering intelligence for cloud-native teams
              </div>
              <span className="text-xs text-zinc-600">No hype. No vendor theatre.</span>
            </div>

            <div className="grid items-end gap-12 lg:grid-cols-[1.25fr_0.75fr]">
              <div>
                <h1 className="max-w-5xl text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-white md:text-7xl lg:text-[88px]">
                  Understand the systems
                  <span className="block premium-gradient-text">behind modern infrastructure.</span>
                </h1>
                <p className="mt-8 max-w-2xl text-base leading-7 text-zinc-400 md:text-lg">
                  RapidReach is a practitioner-first knowledge platform for DevOps, platform engineering, Kubernetes, SRE, cloud infrastructure, and software delivery. Learn the architecture, trade-offs, and operating patterns that make production systems work.
                </p>

                <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                  <Link href="/learning-paths" className="premium-button-primary group">
                    Explore learning paths
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link href="/blog" className="premium-button-secondary">
                    Read the latest analysis
                  </Link>
                </div>
              </div>

              <div className="premium-panel relative overflow-hidden p-6 md:p-7">
                <div className="absolute right-0 top-0 h-32 w-32 bg-electric-cyan/10 blur-3xl" />
                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">RapidReach index</p>
                    <p className="mt-1 text-sm text-zinc-300">A living map of cloud-native engineering.</p>
                  </div>
                  <Sparkles className="h-4 w-4 text-electric-cyan" />
                </div>

                <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.06]">
                  <div className="bg-[#090909] p-5">
                    <BookOpen className="mb-6 h-4 w-4 text-zinc-500" />
                    <p className="text-2xl font-semibold tracking-tight text-white">{siteStats.totalPosts}</p>
                    <p className="mt-1 text-xs text-zinc-600">Published articles</p>
                  </div>
                  <div className="bg-[#090909] p-5">
                    <Users className="mb-6 h-4 w-4 text-zinc-500" />
                    <p className="text-2xl font-semibold tracking-tight text-white">{siteStats.totalUsers}</p>
                    <p className="mt-1 text-xs text-zinc-600">Registered readers</p>
                  </div>
                  <div className="col-span-2 bg-[#090909] p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-white">8 core engineering domains</p>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">Structured from foundations to production operations.</p>
                      </div>
                      <div className="flex -space-x-2">
                        {[Boxes, GitBranch, Cloud, Gauge].map((Icon, index) => (
                          <span key={index} className="grid h-9 w-9 place-items-center rounded-full border border-white/[0.08] bg-[#111]">
                            <Icon className="h-3.5 w-3.5 text-zinc-400" />
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/[0.05] py-6">
        <div className="container mx-auto px-6">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-3 text-xs text-zinc-600">
            <span>Architecture-first learning</span>
            <span className="hidden h-1 w-1 rounded-full bg-zinc-800 sm:block" />
            <span>Production-focused guides</span>
            <span className="hidden h-1 w-1 rounded-full bg-zinc-800 sm:block" />
            <span>Vendor-neutral mental models</span>
            <span className="hidden h-1 w-1 rounded-full bg-zinc-800 sm:block" />
            <span>Continuously updated</span>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="premium-section-label">Explore the field</p>
                <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-[-0.035em] text-white md:text-5xl">
                  Learn by engineering domain, not by random tutorials.
                </h2>
              </div>
              <p className="max-w-md text-sm leading-6 text-zinc-500">
                Build durable mental models first, then learn the tools that implement them.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {domains.map((domain, index) => {
                const Icon = domain.icon
                const count = Object.values(siteStats.domainCounts)[index] || 0
                return (
                  <Link key={domain.title} href={domain.href} className="premium-domain-card group">
                    <div className="mb-9 flex items-start justify-between gap-4">
                      <span className="grid h-11 w-11 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.03]">
                        <Icon className="h-4.5 w-4.5 text-zinc-300" />
                      </span>
                      <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-700">{domain.eyebrow}</span>
                    </div>
                    <h3 className="text-lg font-medium tracking-tight text-zinc-100 transition-colors group-hover:text-white">{domain.title}</h3>
                    <p className="mt-3 min-h-[72px] text-sm leading-6 text-zinc-500">{domain.description}</p>
                    <div className="mt-7 flex items-center justify-between border-t border-white/[0.05] pt-4">
                      <span className="text-xs text-zinc-700">{count} articles</span>
                      <span className="flex items-center gap-1.5 text-xs text-zinc-500 transition-colors group-hover:text-electric-cyan">
                        Explore <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/[0.05] bg-white/[0.012] py-24 md:py-28">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 flex items-end justify-between gap-6">
              <div>
                <p className="premium-section-label">Latest intelligence</p>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-white md:text-4xl">Fresh from the knowledge base.</h2>
              </div>
              <Link href="/blog" className="hidden items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-white sm:flex">
                View all articles <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {latestPosts.length > 0 ? (
              <div className="grid gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.06] lg:grid-cols-3">
                {latestPosts.map((post, index) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className={`group bg-[#080808] p-6 transition-colors hover:bg-[#0d0d0d] ${index === 0 ? 'lg:col-span-2 lg:row-span-2 lg:p-8' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-electric-cyan/80">
                        {post.category || 'Engineering'}
                      </span>
                      <span className="text-[11px] text-zinc-700">{formatDate(post.created_at)}</span>
                    </div>
                    <h3 className={`mt-8 font-medium tracking-tight text-zinc-100 transition-colors group-hover:text-white ${index === 0 ? 'max-w-2xl text-3xl leading-tight md:text-4xl' : 'text-lg leading-snug'}`}>
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className={`mt-4 text-sm leading-6 text-zinc-500 ${index === 0 ? 'max-w-2xl line-clamp-3' : 'line-clamp-2'}`}>
                        {post.excerpt}
                      </p>
                    )}
                    <div className="mt-8 flex items-center justify-between border-t border-white/[0.05] pt-4">
                      <span className="text-xs text-zinc-700">{post.estimated_read_time || 5} min read</span>
                      <ArrowRight className="h-4 w-4 text-zinc-700 transition-all group-hover:translate-x-0.5 group-hover:text-electric-cyan" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="premium-panel p-10 text-center">
                <Code2 className="mx-auto h-6 w-6 text-zinc-700" />
                <p className="mt-4 text-sm text-zinc-500">The knowledge base is being prepared. Check back for new engineering content.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <p className="premium-section-label">Why RapidReach</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white md:text-5xl">
                The internet has enough content. Engineers need better context.
              </h2>
              <p className="mt-6 text-sm leading-7 text-zinc-500">
                RapidReach is designed to become the place you use to understand why infrastructure behaves the way it does—and what to do when the happy path ends.
              </p>
            </div>

            <div className="divide-y divide-white/[0.05] border-y border-white/[0.05]">
              {productPrinciples.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.title} className="grid gap-5 py-7 sm:grid-cols-[48px_1fr]">
                    <span className="grid h-11 w-11 place-items-center rounded-xl border border-white/[0.06] bg-white/[0.025]">
                      <Icon className="h-4 w-4 text-zinc-400" />
                    </span>
                    <div>
                      <h3 className="text-base font-medium text-zinc-100">{item.title}</h3>
                      <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">{item.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-24 md:pb-32">
        <div className="premium-cta mx-auto max-w-6xl overflow-hidden p-8 md:p-12">
          <div className="relative z-10 grid items-end gap-10 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="premium-section-label">Stay current without doom-scrolling</p>
              <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-[-0.04em] text-white md:text-5xl">
                Get the cloud-native signal worth keeping.
              </h2>
              <p className="mt-5 max-w-2xl text-sm leading-6 text-zinc-400">
                Follow new guides, learning paths, architecture breakdowns, and important ecosystem changes from one place.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link href="/subscribe" className="premium-button-primary whitespace-nowrap">
                Join RapidReach
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/about" className="premium-button-secondary whitespace-nowrap text-center">
                What we are building
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
