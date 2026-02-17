'use client'

import { useState } from 'react'
import { Bookmark, Heart, Share2, Twitter, Linkedin, Link as LinkIcon, Check } from 'lucide-react'

interface ArticleActionsProps {
  postId: string
  title?: string
}

export default function ArticleActions({ postId, title = 'Article' }: ArticleActionsProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likes, setLikes] = useState(0)
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
    <div className="sticky top-24 space-y-2">
      {/* Like */}
      <button
        onClick={handleLike}
        className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
          isLiked
            ? 'bg-red-500/10 border-red-500/30 text-red-400'
            : 'bg-white/[0.02] border-white/[0.04] text-gray-500 hover:text-red-400 hover:bg-red-500/5 hover:border-red-500/20'
        }`}
      >
        <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        <span className="text-xs font-medium">{likes}</span>
      </button>

      {/* Bookmark */}
      <button
        onClick={() => setIsBookmarked(!isBookmarked)}
        className={`w-full flex items-center justify-center p-3 rounded-lg border transition-colors ${
          isBookmarked
            ? 'bg-electric-cyan/10 border-electric-cyan/30 text-electric-cyan'
            : 'bg-white/[0.02] border-white/[0.04] text-gray-500 hover:text-electric-cyan hover:bg-electric-cyan/5 hover:border-electric-cyan/20'
        }`}
      >
        <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
      </button>

      {/* Share */}
      <div className="relative">
        <button
          onClick={() => setShowShareMenu(!showShareMenu)}
          className="w-full flex items-center justify-center p-3 rounded-lg border bg-white/[0.02] border-white/[0.04] text-gray-500 hover:text-cyber-lime hover:bg-cyber-lime/5 hover:border-cyber-lime/20 transition-colors"
        >
          <Share2 className="w-4 h-4" />
        </button>

        {showShareMenu && (
          <div className="absolute left-full ml-3 top-0 w-44 rounded-xl bg-[#0a0a0a] border border-white/[0.06] shadow-2xl p-1.5 space-y-0.5 z-50">
            <a
              href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/[0.04] text-gray-400 hover:text-white transition-colors"
            >
              <Twitter className="w-3.5 h-3.5" />
              <span className="text-xs">Twitter</span>
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/[0.04] text-gray-400 hover:text-white transition-colors"
            >
              <Linkedin className="w-3.5 h-3.5" />
              <span className="text-xs">LinkedIn</span>
            </a>
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/[0.04] text-gray-400 hover:text-white transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-cyber-lime" />
                  <span className="text-xs text-cyber-lime">Copied!</span>
                </>
              ) : (
                <>
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span className="text-xs">Copy Link</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
