import Link from 'next/link'
import { Github, Twitter, Linkedin, Rss } from 'lucide-react'

const footerSections = [
  {
    title: 'Learn',
    links: [
      { label: 'All Articles', href: '/blog' },
      { label: 'Learning Paths', href: '/learning-paths' },
      { label: 'News Feed', href: '/news' },
      { label: 'Kubernetes', href: '/category/kubernetes' },
      { label: 'Terraform', href: '/category/terraform' },
    ],
  },
  {
    title: 'Topics',
    links: [
      { label: 'CI/CD & GitOps', href: '/category/cicd' },
      { label: 'Observability', href: '/category/observability' },
      { label: 'Security', href: '/category/security' },
      { label: 'Platform Engineering', href: '/category/platform-engineering' },
      { label: 'Cloud', href: '/category/cloud' },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Newsletter', href: '/subscribe' },
      { label: 'Sign Up', href: '/auth/signup' },
    ],
  },
]

const socialLinks = [
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Rss, href: '/news', label: 'RSS' },
]

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.04] bg-deep-charcoal">
      {/* Gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-electric-cyan/30 to-transparent" />

      <div className="container mx-auto px-6 pt-16 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-electric-cyan to-cyber-lime flex items-center justify-center">
                <span className="text-deep-charcoal font-bold text-xs">R</span>
              </div>
              <span className="text-base font-bold text-white tracking-tight">
                Rapid<span className="text-electric-cyan">Reach</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed mb-5 max-w-xs">
              Practitioner-written DevOps and Platform Engineering content for the cloud-native era.
            </p>
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="p-2 rounded-lg text-gray-600 hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  <social.icon className="w-4 h-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Link sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-white/[0.04]">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} RapidReach. Built for the DevOps community.
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => typeof document !== 'undefined' && document.dispatchEvent(new CustomEvent('open-command-palette'))}
              className="text-xs text-gray-600 hover:text-gray-400 transition-colors flex items-center gap-1.5"
            >
              <kbd className="px-1.5 py-0.5 rounded bg-white/[0.04] text-[10px] font-mono">⌘K</kbd>
              Quick nav
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
