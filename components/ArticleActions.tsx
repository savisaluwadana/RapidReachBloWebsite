'use client'

import { useState } from 'react'
import { Bookmark, Heart, Share2, Twitter, Linkedin, Link as LinkIcon, Check } from 'lucide-react'

interface ArticleActionsProps {
  postId?: string
  title?: string
}

export default function ArticleActions({ postId = '1', title = 'Article' }: ArticleActionsProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likes, setLikes] = useState(42)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikes(prev => isLiked ? prev - 1 : prev + 1)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareUrl = typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : ''
  const shareTitle = encodeURIComponent(title)

  return (
    <div className="sticky top-24 space-y-3">
      {/* Like */}
      <button
        onClick={handleLike}
        className={`w-full flex items-center justify-center gap-3 p-4 rounded-xl border transition-all ${
          isLiked
            ? 'bg-red-500/20 border-red-500/50 text-red-400'
            : 'bg-white/5 border-white/10 text-gray-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30'
        }`}
      >
        <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
        <span className="font-semibold">{likes}</span>
      </button>

      {/* Bookmark */}
      <button
        onClick={() => setIsBookmarked(!isBookmarked)}
        className={`w-full flex items-center justify-center p-4 rounded-xl border transition-all ${
          isBookmarked
            ? 'bg-electric-cyan/20 border-electric-cyan/50 text-electric-cyan'
            : 'bg-white/5 border-white/10 text-gray-400 hover:text-electric-cyan hover:bg-electric-cyan/10 hover:border-electric-cyan/30'
        }`}
      >
        <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
      </button>

      {/* Share */}
      <div className="relative">
        <button
          onClick={() => setShowShareMenu(!showShareMenu)}
          className="w-full flex items-center justify-center p-4 rounded-xl border bg-white/5 border-white/10 text-gray-400 hover:text-cyber-lime hover:bg-cyber-lime/10 hover:border-cyber-lime/30 transition-all"
        >
          <Share2 className="w-5 h-5" />
        </button>

        {showShareMenu && (
          <div className="absolute left-full ml-4 top-0 w-48 rounded-xl bg-deep-charcoal border border-white/10 shadow-glow-lg p-2 space-y-1 z-50">
            <a
              href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-all"
            >
              <Twitter className="w-5 h-5" />
              <span className="text-sm font-semibold">Twitter</span>
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-all"
            >
              <Linkedin className="w-5 h-5" />
              <span className="text-sm font-semibold">LinkedIn</span>
            </a>
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5 text-cyber-lime" />
                  <span className="text-sm font-semibold text-cyber-lime">Copied!</span>
                </>
              ) : (
                <>
                  <LinkIcon className="w-5 h-5" />
                  <span className="text-sm font-semibold">Copy Link</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
