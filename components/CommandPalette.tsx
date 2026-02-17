'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Command } from 'cmdk'
import { Search, FileText, Zap, BookOpen, TrendingUp, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { searchPosts } from '@/lib/actions/posts'

interface CommandItem {
  id: string
  title: string
  category: string
  url: string
  icon: any
}

const staticItems: CommandItem[] = [
  { id: 'nav-blog', title: 'All Articles', category: 'Navigation', url: '/blog', icon: FileText },
  { id: 'nav-learning', title: 'Learning Paths', category: 'Navigation', url: '/learning-paths', icon: BookOpen },
  { id: 'nav-news', title: 'DevOps News', category: 'Navigation', url: '/news', icon: Zap },
  { id: 'nav-subscribe', title: 'Subscribe', category: 'Navigation', url: '/subscribe', icon: TrendingUp },
]

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [filteredItems, setFilteredItems] = useState(staticItems)
  const [dynamicItems, setDynamicItems] = useState<CommandItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    const handleOpenEvent = () => setOpen(true)

    document.addEventListener('keydown', down)
    document.addEventListener('open-command-palette', handleOpenEvent)
    return () => {
      document.removeEventListener('keydown', down)
      document.removeEventListener('open-command-palette', handleOpenEvent)
    }
  }, [])

  useEffect(() => {
    if (!search) {
      setFilteredItems(staticItems)
      setDynamicItems([])
      setIsSearching(false)
      return
    }

    const filtered = staticItems.filter((item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
    )

    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    setIsSearching(true)

    searchTimerRef.current = setTimeout(async () => {
      try {
        const results = await searchPosts(search, 5)
        const postItems: CommandItem[] = results.map((post: { id: string; title: string; slug: string; category: string }) => ({
          id: `post-${post.id}`,
          title: post.title,
          category: 'Articles',
          url: `/blog/${post.slug}`,
          icon: FileText,
        }))
        setDynamicItems(postItems)
        setFilteredItems([...filtered, ...postItems])
      } catch {
        setFilteredItems(filtered)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    setFilteredItems(filtered)

    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    }
  }, [search])

  const handleSelect = useCallback((url: string) => {
    setOpen(false)
    setSearch('')
    router.push(url)
  }, [router])

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-fade-in"
        onClick={() => setOpen(false)}
      />

      {/* Command Palette */}
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-50 px-4 animate-scale-in">
        <Command
          className="rounded-xl border border-white/[0.06] bg-[#0a0a0a]/95 backdrop-blur-2xl shadow-2xl overflow-hidden"
          shouldFilter={false}
        >
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.04]">
            <Search className="w-4 h-4 text-gray-500" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search articles, news, learning paths..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-600 outline-none"
            />
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-md hover:bg-white/[0.06] transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <Command.List className="max-h-[320px] overflow-y-auto p-2">
            {filteredItems.length === 0 && !isSearching && (
              <Command.Empty className="py-6 text-center text-xs text-gray-600">
                No results found.
              </Command.Empty>
            )}

            {isSearching && (
              <div className="py-6 text-center text-xs text-gray-600">
                <div className="animate-spin w-4 h-4 border-2 border-electric-cyan border-t-transparent rounded-full mx-auto mb-2" />
                Searching articles...
              </div>
            )}

            {['Navigation', 'Articles', 'Learning Paths', 'News'].map((category) => {
              const categoryItems = filteredItems.filter((item) => item.category === category)
              if (categoryItems.length === 0) return null

              return (
                <Command.Group key={category} heading={category}>
                  <div className="px-2 py-1.5 text-[9px] font-semibold text-gray-600 uppercase tracking-widest">
                    {category}
                  </div>
                  {categoryItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <Command.Item
                        key={item.id}
                        value={item.title}
                        onSelect={() => handleSelect(item.url)}
                        className="group"
                      >
                        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-white/[0.04] transition-colors">
                          <div className="p-1.5 rounded-md bg-white/[0.03] group-hover:bg-electric-cyan/10 transition-colors">
                            <Icon className="w-3.5 h-3.5 text-gray-500 group-hover:text-electric-cyan transition-colors" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm text-gray-300 group-hover:text-white transition-colors">
                              {item.title}
                            </div>
                          </div>
                          <kbd className="opacity-0 group-hover:opacity-100 transition-opacity px-1.5 py-0.5 rounded bg-white/[0.04] text-gray-600 text-[9px] font-mono">
                            ↵
                          </kbd>
                        </div>
                      </Command.Item>
                    )
                  })}
                </Command.Group>
              )
            })}
          </Command.List>

          <div className="flex items-center justify-between px-4 py-2 border-t border-white/[0.04] bg-white/[0.01]">
            <div className="flex items-center gap-3 text-[9px] text-gray-600">
              <div className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-white/[0.04] text-gray-500 font-mono">↑↓</kbd>
                <span>Navigate</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-white/[0.04] text-gray-500 font-mono">↵</kbd>
                <span>Select</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-white/[0.04] text-gray-500 font-mono">Esc</kbd>
                <span>Close</span>
              </div>
            </div>
            <div className="text-[9px] text-gray-600">
              {filteredItems.length} results
            </div>
          </div>
        </Command>
      </div>
    </>
  )
}
