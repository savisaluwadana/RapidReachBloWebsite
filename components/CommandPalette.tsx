'use client'

import { useEffect, useState, useCallback } from 'react'
import { Command } from 'cmdk'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, FileText, Zap, BookOpen, TrendingUp, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CommandItem {
  id: string
  title: string
  category: string
  url: string
  icon: any
}

// Static navigation items always available
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
  const router = useRouter()

  // Toggle with CMD/CTRL + K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    // Allow other components (e.g. Navbar search button) to open the palette
    const handleOpenEvent = () => setOpen(true)

    document.addEventListener('keydown', down)
    document.addEventListener('open-command-palette', handleOpenEvent)
    return () => {
      document.removeEventListener('keydown', down)
      document.removeEventListener('open-command-palette', handleOpenEvent)
    }
  }, [])

  // Search posts dynamically when search query changes
  useEffect(() => {
    if (!search) {
      setFilteredItems(staticItems)
      setDynamicItems([])
      return
    }

    const filtered = staticItems.filter((item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
    )
    setFilteredItems([...filtered, ...dynamicItems])
  }, [search, dynamicItems])

  const handleSelect = useCallback((url: string) => {
    setOpen(false)
    setSearch('')
    router.push(url)
  }, [router])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={() => setOpen(false)}
          />

          {/* Command Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4"
          >
            <Command
              className="rounded-2xl border border-white/20 bg-deep-charcoal-50/95 backdrop-blur-2xl shadow-glass overflow-hidden"
              shouldFilter={false}
            >
              {/* Search Input with Glassmorphism */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10">
                <Search className="w-5 h-5 text-gray-400" />
                <Command.Input
                  value={search}
                  onValueChange={setSearch}
                  placeholder="Search articles, news, learning paths..."
                  className="flex-1 bg-transparent text-white placeholder:text-gray-500 outline-none text-lg"
                />
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <Command.List className="max-h-[400px] overflow-y-auto p-3">
                {filteredItems.length === 0 && (
                  <Command.Empty className="py-8 text-center text-gray-500">
                    No results found.
                  </Command.Empty>
                )}

                {/* Group by category */}
                {['Navigation', 'Articles', 'Learning Paths', 'News'].map((category) => {
                  const categoryItems = filteredItems.filter((item) => item.category === category)
                  
                  if (categoryItems.length === 0) return null

                  return (
                    <Command.Group
                      key={category}
                      heading={category}
                      className="mb-4"
                    >
                      <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
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
                            <motion.div
                              whileHover={{ x: 4 }}
                              className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-white/5 transition-all duration-200"
                            >
                              <div className="p-2 rounded-lg bg-electric-cyan/10 group-hover:bg-electric-cyan/20 transition-colors">
                                <Icon className="w-4 h-4 text-electric-cyan" />
                              </div>
                              <div className="flex-1">
                                <div className="text-white font-medium group-hover:text-electric-cyan transition-colors">
                                  {item.title}
                                </div>
                              </div>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <kbd className="px-2 py-1 rounded bg-white/10 text-white/60 text-xs font-mono">
                                  ↵
                                </kbd>
                              </div>
                            </motion.div>
                          </Command.Item>
                        )
                      })}
                    </Command.Group>
                  )
                })}
              </Command.List>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-3 border-t border-white/10 bg-white/5">
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/60 font-mono">↑↓</kbd>
                    <span>Navigate</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/60 font-mono">↵</kbd>
                    <span>Select</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/60 font-mono">Esc</kbd>
                    <span>Close</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {filteredItems.length} results
                </div>
              </div>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
