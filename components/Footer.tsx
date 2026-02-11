import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="relative py-12 bg-deep-charcoal border-t border-white/10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <Link href="/" className="inline-block">
              <h3 className="text-xl font-bold gradient-text mb-4">RapidReach</h3>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your trusted source for DevOps, Platform Engineering, and Cloud Native expertise.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Content</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/blog" className="hover:text-electric-cyan transition-colors">All Articles</Link></li>
              <li><Link href="/learning-paths" className="hover:text-electric-cyan transition-colors">Learning Paths</Link></li>
              <li><Link href="/news" className="hover:text-electric-cyan transition-colors">News & Updates</Link></li>
              <li><Link href="/category/kubernetes" className="hover:text-electric-cyan transition-colors">Kubernetes</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Categories</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/category/platform-engineering" className="hover:text-electric-cyan transition-colors">Platform Engineering</Link></li>
              <li><Link href="/category/cicd" className="hover:text-electric-cyan transition-colors">CI/CD</Link></li>
              <li><Link href="/category/security" className="hover:text-electric-cyan transition-colors">Security</Link></li>
              <li><Link href="/category/observability" className="hover:text-electric-cyan transition-colors">Observability</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/about" className="hover:text-electric-cyan transition-colors">About Us</Link></li>
              <li><Link href="/subscribe" className="hover:text-electric-cyan transition-colors">Newsletter</Link></li>
              <li><Link href="/auth/signup" className="hover:text-electric-cyan transition-colors">Join Community</Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-white/10 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} RapidReach. Made with ❤️ for the DevOps community.
          </p>
          <p className="text-gray-600 text-xs mt-2">
            Press <kbd className="px-2 py-1 rounded bg-white/10 text-gray-400 font-mono">⌘K</kbd> for quick navigation
          </p>
        </div>
      </div>
    </footer>
  )
}
