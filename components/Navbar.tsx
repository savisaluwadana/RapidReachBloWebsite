'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, Menu, X, ChevronRight, LayoutDashboard, LogOut, User as UserIcon } from 'lucide-react'
import { getCurrentUser, signOut } from '@/lib/actions/auth'
import type { UserProfile } from '@/lib/types/database'

const categories = ['All', 'Kubernetes', 'Platform Engineering', 'Terraform', 'CI/CD', 'Security', 'Cloud Native']

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    const currentUser = await getCurrentUser()
    setUser(currentUser)
  }

  const handleLogout = async () => {
    await signOut()
    setUser(null)
    setShowUserMenu(false)
    window.location.href = '/'
  }

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
            <button className="p-2 rounded-lg hover:bg-white/5 transition-colors hidden md:block">
              <Search className="w-5 h-5 text-gray-400" />
            </button>
            
            {user ? (
              <div className="relative hidden md:block">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-cyber flex items-center justify-center text-white font-bold">
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold text-white">{user.full_name.split(' ')[0]}</span>
                </button>
                
                {showUserMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 rounded-xl bg-deep-charcoal border border-white/10 shadow-glow-lg p-2 z-50">
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="font-semibold text-white">{user.full_name}</p>
                        <p className="text-sm text-gray-400 truncate">{user.email}</p>
                        <p className="text-xs text-electric-cyan mt-1 capitalize">{user.role}</p>
                      </div>
                      
                      {user.role === 'admin' && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-all"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <LayoutDashboard className="w-5 h-5" />
                          <span className="font-semibold">Admin Panel</span>
                        </Link>
                      )}
                      
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-all"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <UserIcon className="w-5 h-5" />
                        <span className="font-semibold">Profile</span>
                      </Link>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/10 text-gray-300 hover:text-red-400 transition-all"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="font-semibold">Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link 
                href="/auth/signin"
                className="hidden md:block px-6 py-2.5 rounded-xl bg-gradient-cyber text-white font-semibold shadow-glow-md hover:shadow-glow-lg transition-all"
              >
                Sign In
              </Link>
            )}
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
            <Link
              key={category}
              href={category === 'All' ? '/articles' : `/articles?category=${encodeURIComponent(category)}`}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                category === 'All'
                  ? 'bg-electric-cyan/20 text-electric-cyan'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {category}
            </Link>
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
            {user && (
              <div className="pb-4 border-b border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-cyber" />
                  <div>
                    <p className="font-semibold text-white">{user.full_name}</p>
                    <p className="text-sm text-gray-400">{user.email}</p>
                  </div>
                </div>
                <p className="text-xs text-electric-cyan capitalize">{user.role}</p>
              </div>
            )}
            
            <Link href="/articles" className="block text-lg text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>
              Articles
            </Link>
            <Link href="/learning-paths" className="block text-lg text-gray-300 hover:text-white">
              Learning Paths
            </Link>
            <Link href="/news" className="block text-lg text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>
              News
            </Link>
            <Link href="/about" className="block text-lg text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>
              About
            </Link>

            {user && user.role === 'admin' && (
              <Link
                href="/admin"
                className="flex items-center gap-2 text-electric-cyan hover:text-cyber-lime font-semibold transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <LayoutDashboard className="w-5 h-5" />
                Admin Panel
              </Link>
            )}

            <div className="pt-4 border-t border-white/10 space-y-3">
              {user ? (
                <button
                  onClick={() => {
                    handleLogout()
                    setIsMenuOpen(false)
                  }}
                  className="w-full px-6 py-3 rounded-xl bg-red-500/20 text-red-400 font-semibold border border-red-500/30 hover:bg-red-500/30 transition-all"
                >
                  Sign Out
                </button>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="block w-full px-6 py-3 rounded-xl bg-gradient-cyber text-white font-semibold text-center shadow-glow-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block w-full px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-center hover:bg-white/10 transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  )
}
