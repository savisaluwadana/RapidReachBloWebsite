'use client'

import { Calendar, Clock, TrendingUp, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { formatCategory } from '@/lib/utils'

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
  slug: string
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
  slug,
  featured = false,
  trending = false,
}: ArticleCardProps) {
  return (
    <Link href={`/blog/${slug}`} className={featured ? 'md:col-span-2' : ''}>
      <article className="group relative h-full rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-all duration-300 overflow-hidden">
        {/* Top gradient line on hover */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-electric-cyan/0 to-transparent group-hover:via-electric-cyan/40 transition-all duration-500" />

        {/* Image area */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-deep-charcoal-50 to-deep-charcoal-100">
          <div className="absolute inset-0 bg-mesh-gradient opacity-30" />
          
          {/* Category pill */}
          <div className="absolute top-3 left-3 z-10">
            <span className="px-2.5 py-1 rounded-md bg-deep-charcoal/80 backdrop-blur-md border border-white/[0.08] text-electric-cyan text-[11px] font-semibold uppercase tracking-wider">
              {formatCategory(category)}
            </span>
          </div>

          {/* Badges */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
            {trending && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-cyber-lime/15 backdrop-blur-md border border-cyber-lime/20">
                <TrendingUp className="w-3 h-3 text-cyber-lime" />
                <span className="text-[10px] font-bold text-cyber-lime">Trending</span>
              </span>
            )}
            {featured && (
              <span className="px-2 py-1 rounded-md bg-electric-cyan/15 backdrop-blur-md border border-electric-cyan/20 text-[10px] font-bold text-electric-cyan">
                Featured
              </span>
            )}
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-deep-charcoal via-transparent to-transparent opacity-60" />
          <div className="absolute bottom-3 right-3 w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <ArrowUpRight className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className={`font-semibold text-white group-hover:text-electric-cyan transition-colors duration-200 mb-2 leading-snug ${
            featured ? 'text-xl' : 'text-[15px]'
          }`}>
            {title}
          </h3>

          <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">
            {excerpt}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-electric-cyan/30 to-cyber-lime/30 flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">{author.name.charAt(0)}</span>
              </div>
              <span className="text-xs text-gray-400 font-medium">{author.name}</span>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-gray-600">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {readTime}
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
