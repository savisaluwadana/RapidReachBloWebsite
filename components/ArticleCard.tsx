'use client'

import { motion } from 'framer-motion'
import { Calendar, Clock, User, TrendingUp, Bookmark } from 'lucide-react'
import Image from 'next/image'

interface ArticleCardProps {
  title: string
  excerpt: string
  author: {
    name: string
    avatar: string
    role?: string
  }
  category: string
  readTime: string
  date: string
  image: string
  featured?: boolean
  trending?: boolean
}

export default function ArticleCard({
  title,
  excerpt,
  author,
  category,
  readTime,
  date,
  image,
  featured = false,
  trending = false,
}: ArticleCardProps) {
  return (
    <motion.article
      whileHover={{ y: -8 }}
      className={`group cursor-pointer ${
        featured ? 'md:col-span-2' : ''
      }`}
    >
      <div className="relative h-full rounded-2xl overflow-hidden bg-deep-charcoal-50 border border-white/10 hover:border-electric-cyan/50 transition-all duration-300">
        {/* Image */}
        <div className="relative h-64 overflow-hidden bg-gradient-to-br from-electric-cyan/20 to-cyber-lime/20">
          <div className="absolute inset-0 bg-mesh-gradient opacity-50" />
          {trending && (
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-cyber-lime/20 backdrop-blur-xl border border-cyber-lime/30">
              <TrendingUp className="w-4 h-4 text-cyber-lime" />
              <span className="text-xs font-semibold text-cyber-lime">Trending</span>
            </div>
          )}
          <button className="absolute top-4 left-4 z-10 p-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 transition-colors">
            <Bookmark className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Category */}
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-lg bg-electric-cyan/10 text-electric-cyan text-xs font-semibold uppercase tracking-wider">
              {category}
            </span>
            {featured && (
              <span className="px-3 py-1 rounded-lg bg-cyber-lime/10 text-cyber-lime text-xs font-semibold">
                FEATURED
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className={`font-bold text-white group-hover:text-electric-cyan transition-colors mb-3 ${
            featured ? 'text-2xl md:text-3xl' : 'text-xl'
          }`}>
            {title}
          </h3>

          {/* Excerpt */}
          <p className="text-gray-400 leading-relaxed mb-4 line-clamp-2">
            {excerpt}
          </p>

          {/* Metadata */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-cyber" />
              <div>
                <p className="text-sm font-semibold text-white">{author.name}</p>
                {author.role && (
                  <p className="text-xs text-gray-500">{author.role}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-gray-500 text-xs">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{date}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{readTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  )
}
