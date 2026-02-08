'use client'

import { useEffect, useState } from 'react'

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const updateProgress = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY
      const trackLength = documentHeight - windowHeight
      const percentage = (scrollTop / trackLength) * 100
      setProgress(Math.min(100, Math.max(0, percentage)))
    }

    window.addEventListener('scroll', updateProgress)
    updateProgress()

    return () => window.removeEventListener('scroll', updateProgress)
  }, [])

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-50 bg-white/10">
      <div 
        className="h-full bg-gradient-to-r from-electric-cyan via-cyber-lime to-electric-cyan transition-all duration-150 ease-out shadow-glow-md"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
