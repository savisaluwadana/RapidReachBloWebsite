'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, Menu, X, ChevronRight } from 'lucide-react'

const categories = ['All', 'Kubernetes', 'Platform Engineering', 'Terraform', 'CI/CD', 'Security', 'Cloud Native']

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-deep-charcoal/90 border-b border-white/10">
      <div className="container mx-auto px-6">
        {/* Main Navigation */}
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-cyber flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-white font-bold text-xl">R</span>
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">RapidReach</h1>
              <p className="text-xs text-gray-500">DevOps & Cloud Native</p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/articles" className="text-gray-300 hover:text-white transition-colors">
              Articles
            </Link>
            <Link href="/learning-paths" className="text-gray-300 hover:text-white transition-colors">
              Learning Paths
            </Link>
            <Link href="/news" className="text-gray-300 hover:text-white transition-colors">
              News
            </Link>
            <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
              About
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
              <Search className="w-5 h-5 text-gray-400" />
            </button>
            <button 
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link href="/subscribe">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden md:block px-6 py-2 rounded-xl bg-gradient-cyber text-white font-semibold shadow-glow-sm hover:shadow-glow-md transition-all"
              >
                Subscribe
              </motion.button>
            </Link>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="hidden md:flex items-center gap-4 pb-4 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                category === 'All'
                  ? 'bg-electric-cyan/20 text-electric-cyan'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-white/10 bg-deep-charcoal-50"
        >
          <div className="container mx-auto px-6 py-6 space-y-4">
            <Link href="/articles" className="block text-lg text-gray-300 hover:text-white">
              Articles
            </Link>
            <Link href="/learning-paths" className="block text-lg text-gray-300 hover:text-white">
              Learning Paths
            </Link>
            <Link href="/news" className="block text-lg text-gray-300 hover:text-white">
              News
            </Link>
            <Link href="/about" className="block text-lg text-gray-300 hover:text-white">
              About
            </Link>
            <button className="w-full px-6 py-3 rounded-xl bg-gradient-cyber text-white font-semibold">
              Subscribe
            </button>
          </div>
        </motion.div>
      )}
    </nav>
  )
}
