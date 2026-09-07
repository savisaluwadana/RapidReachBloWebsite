import Link from 'next/link'
import {
  ArrowRight,
  Boxes,
  Cloud,
  Code2,
  Gauge,
  GitBranch,
  Layers3,
  LockKeyhole,
  Network,
  Radar,
  TerminalSquare,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import EngineeringAtlas from '@/components/EngineeringAtlas'
import RoleNavigator from '@/components/RoleNavigator'
import { getPosts, getSiteStats } from '@/lib/actions/posts'

const domains = [
  {
    title: 'Kubernetes & Containers',
    countKey: 'Container Orchestration',
    description: 'Go beyond kubectl. Understand scheduling, networking, workloads, debugging, and production operations.',
    href: '/category/kubernetes',
    icon: Boxes,
    eyebrow: 'Orchestration',
  },
  {
    title: 'Platform Engineering',
    countKey: 'Platform Engineering',
    description: 'Build internal platforms, golden paths, developer portals, and paved roads that teams actually use.',
    href: '/category/platform-engineering',
    icon: Layers3,
    eyebrow: 'Developer experience',
  },
  {
    title: 'GitOps & Delivery',
    countKey: 'CI/CD & GitOps',
    description: 'Design safer delivery systems with GitOps, progressive delivery, CI/CD, and release engineering.',
    href: '/category/cicd',
    icon: GitBranch,
    eyebrow: 'Software delivery',
  },
  {
    title: 'Cloud Infrastructure',
    countKey: 'Cloud Platforms',
    description: 'Reason about cloud architecture, IaC, reliability, cost, and the trade-offs behind production systems.',
    href: '/category/cloud',
    icon: Cloud,
    eyebrow: 'Infrastructure',
  },
  {
    title: 'Observability & SRE',
    countKey: 'Observability & SRE',
    description: 'Learn how to measure systems, debug incidents, design SLOs, and operate services with confidence.',
    href: '/category/observability',
    icon: Gauge,
    eyebrow: 'Reliability',
  },
  {
    title: 'Cloud Native Security',
    countKey: 'Security & Compliance',
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
        <div className="absolute inset-x-0 top-0 -z-10 mx-auto h-[700px] max-w-7xl premium-hero-glow" />

        <div className="container mx-auto px-6 pb-20 pt-16 md:pb-28 md:pt-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex flex-wrap items-center gap-3">
              <div className="premium-kicker">
                <span className="h-1.5 w-1.5 rounded-full bg-cyber-lime shadow-[0_0_14px_rgba(0,255,136,0.85)]" />
                Cloud-native engineering, mapped
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-700">RR:// KNOWLEDGE SYSTEM ONLINE</span>
            </div>

            <div className="grid items-center gap-14 lg:grid-cols-[1.03fr_0.97fr] xl:gap-20">
              <div>
                <p className="mb-5 text-sm font-medium text-zinc-500">For engineers who want the system, not another tutorial.</p>
                <h1 className="max-w-4xl text-5xl font-semibold leading-[0.96] tracking-[-0.06em] text-white md:text-7xl xl:text-[84px]">
                  See the whole system.
                  <span className="block premium-gradient-text">Learn where it breaks.</span>
                </h1>
                <p className="mt-8 max-w-2xl text-base leading-7 text-zinc-400 md:text-lg">
                  RapidReach connects Kubernetes, platform engineering, GitOps, cloud, SRE, and security into one navigable mental model—so you understand how production systems fit together before they fail together.
                </p>

                <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                  <Link href="/learning-paths" className="premium-button-primary group">
                    Build my engineering map
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link href="/blog" className="premium-button-secondary">
                    Explore the knowledge base
                  </Link>
                </div>

                <div className="mt-10 grid max-w-xl grid-cols-3 gap-px overflow-hidden rounded-xl border border-white/[0.055] bg-white/[0.05]">
                  {[
                    ['Architecture', 'See dependencies'],
                    ['Failure modes', 'Learn the edges'],
                    ['Production', 'Think operationally'],
                  ].map(([title, note]) => (
                    <div key={title} className="bg-[#070809]/90 px-3 py-3.5">
                      <p className="text-xs font-medium text-zinc-300">{title}</p>
                      <p className="mt-1 text-[10px] text-zinc-700">{note}</p>
                    </div>
                  ))}
                </div>
              </div>

              <EngineeringAtlas totalPosts={siteStats.totalPosts} totalUsers={siteStats.totalUsers} />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/[0.05] py-5">
        <div className="container mx-auto px-6">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-8 gap-y-3 font-mono text-[10px] uppercase tracking-[0.13em] text-zinc-700">
            <span>Architecture-first</span>
            <span className="hidden h-1 w-1 rounded-full bg-zinc-800 sm:block" />
            <span>Production-focused</span>
            <span className="hidden h-1 w-1 rounded-full bg-zinc-800 sm:block" />
            <span>Vendor-neutral</span>
            <span className="hidden h-1 w-1 rounded-full bg-zinc-800 sm:block" />
            <span>Continuously evolving</span>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 grid gap-7 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <div>
                <p className="premium-section-label">Your route through the system</p>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white md:text-5xl">Pick the engineer you are becoming.</h2>
              </div>
              <p className="max-w-xl text-sm leading-7 text-zinc-500 lg:justify-self-end">
                The same technologies mean different things depending on the job you need to do. RapidReach reorganizes the knowledge around outcomes, dependencies, and the order that actually makes sense.
              </p>
            </div>
            <RoleNavigator />
          </div>
        </div>
      </section>

      <section className="border-y border-white/[0.05] bg-white/[0.01] py-24 md:py-32">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="premium-section-label">The engineering graph</p>
                <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-[-0.035em] text-white md:text-5xl">
                  Topics are not folders. They are connected systems.
                </h2>
              </div>
              <p className="max-w-md text-sm leading-6 text-zinc-500">
                Move across the stack without losing the architecture that connects one domain to the next.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {domains.map((domain) => {
                const Icon = domain.icon
                const count = siteStats.domainCounts[domain.countKey] || 0
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
                        Open domain <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-28">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 flex items-end justify-between gap-6">
              <div>
                <p className="premium-section-label">Latest signals</p>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-white md:text-4xl">Fresh from the engineering graph.</h2>
              </div>
              <Link href="/blog" className="hidden items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-white sm:flex">
                Open all signals <ArrowRight className="h-4 w-4" />
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
                <p className="mt-4 text-sm text-zinc-500">The knowledge graph is being prepared. New engineering signals will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="border-y border-white/[0.05] bg-white/[0.01] py-24 md:py-32">
        <div className="container mx-auto px-6">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <p className="premium-section-label">The RapidReach difference</p>
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

      <section className="px-6 py-24 md:py-32">
        <div className="premium-cta mx-auto max-w-7xl overflow-hidden p-8 md:p-12">
          <div className="relative z-10 grid items-end gap-10 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="premium-section-label">Your next system starts here</p>
              <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-[-0.04em] text-white md:text-5xl">
                Stop browsing DevOps. Start building your engineering model.
              </h2>
              <p className="mt-5 max-w-2xl text-sm leading-6 text-zinc-400">
                Follow the relationships between architecture, delivery, reliability, security, and the decisions that make real systems survive production.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link href="/auth/signup" className="premium-button-primary whitespace-nowrap">
                Create my map
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/about" className="premium-button-secondary whitespace-nowrap text-center">
                Why RapidReach exists
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
