'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react'
import Link from 'next/link'
import { signIn } from '@/lib/actions/auth'

export default function SignIn() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn(email, password)
      
      // Successful login - redirect based on role
      if (result?.user) {
        const userRole = result.user.user_metadata?.role || 'reader'
        if (userRole === 'admin') {
          router.push('/admin')
        } else {
          router.push('/')
        }
        router.refresh()
      } else {
        setError('Invalid email or password')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-deep-charcoal flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="w-16 h-16 rounded-2xl bg-gradient-cyber mx-auto mb-4 flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400">Sign in to your RapidReach account</p>
        </div>

        {/* Demo Credentials Banner */}
        <div className="rounded-xl bg-electric-cyan/10 border border-electric-cyan/30 p-4 mb-6">
          <p className="text-sm text-electric-cyan font-semibold mb-2">Demo Mode Active</p>
          <p className="text-xs text-gray-300">
            <strong>Admin:</strong> admin@rapidreach.blog / admin123<br />
            <strong>User:</strong> Any email / Any password
          </p>
        </div>

        {/* Sign In Form */}
        <form onSubmit={handleSignIn} className="rounded-2xl bg-white/5 border border-white/10 p-8 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-electric-cyan/50 transition-all"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-300">
                Password
              </label>
              <Link href="/auth/forgot-password" className="text-sm text-electric-cyan hover:text-cyber-lime transition-colors">
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-12 pr-12 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-electric-cyan/50 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              className="w-4 h-4 rounded border-white/10 bg-white/5 text-electric-cyan focus:ring-2 focus:ring-electric-cyan/50"
            />
            <label htmlFor="remember" className="ml-2 text-sm text-gray-300">
              Remember me for 30 days
            </label>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-cyber text-white font-semibold shadow-glow-md hover:shadow-glow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>


        </form>

        {/* Sign Up Link */}
        <p className="text-center mt-6 text-gray-400">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="text-electric-cyan hover:text-cyber-lime transition-colors font-semibold">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
