import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { Users, Target, Zap, BookOpen, ArrowRight, Globe, Heart, Shield, GitBranch, Cloud, Layers } from 'lucide-react'

// ─── SEO Metadata ────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: 'About RapidReach — Built by Savi Saluwadana & Team for the DevOps Community',
  description:
    'RapidReach is a world-class DevOps and Cloud Native knowledge platform built by Savi Saluwadana and a global team of engineers. Learn Kubernetes, Terraform, CI/CD, GitOps, Platform Engineering, and more — free, for the community.',
  keywords: [
    'RapidReach', 'Savi Saluwadana', 'DevOps blog', 'Cloud Native learning platform',
    'Kubernetes tutorials', 'Terraform guides', 'GitOps', 'Platform Engineering',
    'CI/CD learning', 'SRE resources', 'DevOps community', 'free DevOps content',
    'open source DevOps', 'cloud computing education', 'infrastructure as code',
    'AWS tutorials', 'Azure DevOps', 'GCP Kubernetes', 'Docker learning',
    'DevOps for beginners', 'advanced Kubernetes', 'DevOps Sri Lanka',
  ],
  authors: [{ name: 'Savi Saluwadana', url: 'https://rapidreach.blog/about' }],
  creator: 'Savi Saluwadana',
  publisher: 'RapidReach',
  alternates: {
    canonical: 'https://rapidreach.blog/about',
  },
  openGraph: {
    title: 'About RapidReach — Built by Savi Saluwadana & Team for the DevOps Community',
    description:
      'Learn who built RapidReach, our mission to empower the global DevOps community, and how we create world-class Cloud Native content — free for every engineer, everywhere.',
    url: 'https://rapidreach.blog/about',
    siteName: 'RapidReach',
    type: 'profile',
    locale: 'en_US',
    images: [
      {
        url: 'https://rapidreach.blog/og-about.png',
        width: 1200,
        height: 630,
        alt: 'RapidReach — DevOps & Cloud Native Knowledge Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About RapidReach — Built for the Global DevOps Community',
    description:
      'Built by Savi Saluwadana & a global team of practitioners. Free DevOps, Kubernetes, Terraform, and Cloud Native content for engineers worldwide.',
    images: ['https://rapidreach.blog/og-about.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
  },
}

// ─── JSON-LD Structured Data ─────────────────────────────────────────────────
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://rapidreach.blog/#organization',
      name: 'RapidReach',
      url: 'https://rapidreach.blog',
      logo: { '@type': 'ImageObject', url: 'https://rapidreach.blog/logo.png' },
      description:
        'RapidReach is a global DevOps and Cloud Native knowledge platform providing free, practitioner-written content on Kubernetes, Terraform, GitOps, Platform Engineering, CI/CD, and more.',
      founder: {
        '@type': 'Person',
        name: 'Savi Saluwadana',
        url: 'https://rapidreach.blog/about',
        jobTitle: 'Founder & Lead Engineer',
      },
      sameAs: [
        'https://github.com/savisaluwadana',
      ],
      knowsAbout: [
        'Kubernetes', 'Terraform', 'GitOps', 'Platform Engineering',
        'CI/CD', 'Docker', 'AWS', 'Azure', 'GCP', 'Istio', 'ArgoCD',
        'Observability', 'Site Reliability Engineering', 'DevSecOps',
      ],
    },
    {
      '@type': 'WebPage',
      '@id': 'https://rapidreach.blog/about',
      url: 'https://rapidreach.blog/about',
      name: 'About RapidReach',
      isPartOf: { '@id': 'https://rapidreach.blog/#organization' },
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rapidreach.blog' },
          { '@type': 'ListItem', position: 2, name: 'About', item: 'https://rapidreach.blog/about' },
        ],
      },
    },
  ],
}

// ─── Data ────────────────────────────────────────────────────────────────────
const values = [
  {
    icon: <BookOpen className="w-7 h-7 text-electric-cyan" />,
    title: 'Practitioner-First Content',
    description:
      'Every article is written, tested, and validated by engineers with real production experience — not recycled documentation.',
  },
  {
    icon: <Users className="w-7 h-7 text-cyber-lime" />,
    title: 'Community Driven',
    description:
      'Built by the community, for the community. Contributors from every continent shape the content you read every day.',
  },
  {
    icon: <Zap className="w-7 h-7 text-[#F97316]" />,
    title: 'Always Current',
    description:
      'The DevOps landscape moves fast. We track every major release — Kubernetes, Terraform, ArgoCD, Istio — so you never fall behind.',
  },
  {
    icon: <Shield className="w-7 h-7 text-[#5C4EE5]" />,
    title: 'Production-Grade Accuracy',
    description:
      'No toy examples. Every guide is benchmarked against production workloads and peer-reviewed before publishing.',
  },
  {
    icon: <Globe className="w-7 h-7 text-electric-cyan" />,
    title: 'Globally Accessible',
    description:
      'Free, open, and available in every timezone. We believe world-class DevOps education should have no paywall.',
  },
  {
    icon: <Heart className="w-7 h-7 text-red-400" />,
    title: 'Built With Passion',
    description:
      'RapidReach started as a passion project and grew into a platform trusted by engineers from startups to Fortune 500 companies.',
  },
]

const coverageAreas = [
  { icon: <Layers className="w-5 h-5" />, label: 'Container Orchestration', tools: 'Kubernetes · Docker · Containerd' },
  { icon: <GitBranch className="w-5 h-5" />, label: 'CI/CD & GitOps', tools: 'ArgoCD · GitHub Actions · Flux' },
  { icon: <Cloud className="w-5 h-5" />, label: 'Cloud Platforms', tools: 'AWS · Azure · GCP · DigitalOcean' },
  { icon: <Zap className="w-5 h-5" />, label: 'Infrastructure as Code', tools: 'Terraform · Pulumi · Crossplane' },
  { icon: <Shield className="w-5 h-5" />, label: 'Security & Compliance', tools: 'Falco · OPA · Trivy · Vault' },
  { icon: <Globe className="w-5 h-5" />, label: 'Observability & SRE', tools: 'Prometheus · Grafana · OpenTelemetry' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AboutPage() {
  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen bg-deep-charcoal">
        <Navbar />

        <div className="container mx-auto px-6 pt-28 pb-20 max-w-5xl">

          {/* ── Hero ── */}
          <div className="text-center mb-20">
            <p className="text-xs text-electric-cyan uppercase tracking-widest font-medium mb-3">About Us</p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
              Built by{' '}
              <span className="bg-gradient-to-r from-electric-cyan to-cyber-lime bg-clip-text text-transparent">
                Savi Saluwadana
              </span>
              {' '}&amp; Team
              <br className="hidden md:block" />
              for the DevOps Community
            </h1>
            <p className="text-sm text-gray-400 max-w-2xl mx-auto leading-relaxed">
              RapidReach is a free, open knowledge platform dedicated to helping engineers worldwide
              master DevOps, Cloud Native technologies, and Platform Engineering — written by
              practitioners who build in production every day.
            </p>
          </div>

          {/* ── Founder ── */}
          <div className="mb-20">
            <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-8 md:p-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-electric-cyan/40 to-transparent" />
              <div className="flex flex-col md:flex-row items-start gap-8">
                {/* Avatar placeholder */}
                <div className="shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-electric-cyan/20 to-cyber-lime/10 border border-electric-cyan/20 flex items-center justify-center">
                  <span className="text-3xl font-bold text-electric-cyan">S</span>
                </div>
                <div>
                  <p className="text-[10px] text-electric-cyan uppercase tracking-widest font-semibold mb-1">Founder &amp; Lead Engineer</p>
                  <h2 className="text-2xl font-bold text-white mb-1">Savi Saluwadana</h2>
                  <p className="text-xs text-gray-500 mb-4">Platform Administrator · RapidReach</p>
                  <p className="text-sm text-gray-400 leading-relaxed max-w-2xl">
                    Savi Saluwadana created RapidReach with one goal: to give every engineer —
                    regardless of background, location, or budget — access to the same quality of
                    DevOps knowledge that powers the world&apos;s largest infrastructure teams.
                    What started as a personal learning log has evolved into a full-scale platform
                    trusted by engineers across Asia, Europe, North America, and beyond.
                  </p>
                  <p className="text-sm text-gray-400 leading-relaxed max-w-2xl mt-3">
                    With deep expertise in Kubernetes, GitOps, Platform Engineering, and Cloud Native
                    architecture, Savi leads a distributed team of contributors who share one belief:
                    <span className="text-white font-medium"> great DevOps content should be free, accurate, and built for production.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Mission ── */}
          <div className="mb-20">
            <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-8 md:p-10 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-lime/40 to-transparent" />
              <Target className="w-10 h-10 text-cyber-lime mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-3">Our Mission</h2>
              <p className="text-sm text-gray-400 leading-relaxed max-w-2xl mx-auto">
                To democratise world-class DevOps education by providing free, practitioner-written,
                concept-first content that helps engineers — from Colombo to California, from Berlin to
                Bangalore — master Cloud Native technologies and advance their careers without a paywall.
              </p>
            </div>
          </div>

          {/* ── Values ── */}
          <div className="mb-20">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-white mb-2">What We Stand For</h2>
              <p className="text-sm text-gray-500">The principles that guide every article, guide, and learning path we publish.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {values.map((v) => (
                <div
                  key={v.title}
                  className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-6 hover:bg-white/[0.04] transition-colors"
                >
                  <div className="mb-3">{v.icon}</div>
                  <h3 className="text-sm font-semibold text-white mb-2">{v.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{v.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Coverage Areas ── */}
          <div className="mb-20">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-white mb-2">What We Cover</h2>
              <p className="text-sm text-gray-500">
                Deep-dive content across every major DevOps and Cloud Native domain.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {coverageAreas.map((area) => (
                <div
                  key={area.label}
                  className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5 flex items-start gap-4 hover:bg-white/[0.04] transition-colors"
                >
                  <div className="shrink-0 p-2 rounded-lg bg-electric-cyan/10 text-electric-cyan">
                    {area.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white mb-0.5">{area.label}</p>
                    <p className="text-[11px] text-gray-600">{area.tools}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Global Reach ── */}
          <div className="mb-20">
            <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-8 md:p-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#5C4EE5]/40 to-transparent" />
              <div className="text-center mb-8">
                <Globe className="w-10 h-10 text-[#5C4EE5] mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">A Global Platform for Every Engineer</h2>
                <p className="text-sm text-gray-400 max-w-xl mx-auto">
                  RapidReach serves engineers across every continent. Our content is written with
                  global audiences in mind — accessible to developers in Sri Lanka, India, the UK,
                  the US, Australia, Singapore, and everywhere the cloud runs.
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {[
                  { value: '🌏', label: 'Asia Pacific' },
                  { value: '🌍', label: 'Europe & Africa' },
                  { value: '🌎', label: 'Americas' },
                  { value: '🌐', label: 'Worldwide' },
                ].map((region) => (
                  <div key={region.label} className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4">
                    <div className="text-3xl mb-1">{region.value}</div>
                    <p className="text-[11px] text-gray-500">{region.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── CTA ── */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-3">Join the Community</h2>
            <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
              Thousands of DevOps engineers already read, learn, and contribute. Join them — it&apos;s free, always.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-electric-cyan text-white text-sm font-medium hover:bg-electric-cyan/90 transition-colors"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-gray-300 text-sm font-medium hover:bg-white/[0.08] transition-colors"
              >
                Explore Articles
                <BookOpen className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>

        <Footer />
      </main>
    </>
  )
}
