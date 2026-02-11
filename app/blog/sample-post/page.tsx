'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Redirect legacy sample-post URL to the dynamic blog listing
export default function SamplePostRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/blog')
  }, [router])

  return (
    <div className="min-h-screen bg-deep-charcoal flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-electric-cyan/30 border-t-electric-cyan rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Redirecting to blog...</p>
      </div>
    </div>
  )
}
