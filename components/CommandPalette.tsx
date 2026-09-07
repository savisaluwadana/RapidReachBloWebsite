'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Command } from 'cmdk'
import { BookOpen, Bot, BrainCircuit, Boxes, FileText, FlaskConical, Network, Search, ServerCog, Share2, Users, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { searchPosts } from '@/lib/actions/posts'

interface CommandItem {
  id: string
  title: string
  category: string
  url: string
  icon: typeof Search
}

const staticItems: CommandItem[] = [
  { id: 'product-intelligence', title: 'Engineering Intelligence', category: 'Product', url: '/intelligence', icon: BrainCircuit },
  { id: 'product-graph', title: 'Engineering Knowledge Graph', category: 'Product', url: '/graph', icon: Share2 },
  { id: 'product-skills', title: 'Skills Graph', category: 'Product', url: '/skills', icon: Network },
  { id: 'product-labs', title: 'Incident Labs', category: 'Product', url: '/labs', icon: FlaskConical },
  { id: 'product-stack', title: 'Stack Graph', category: 'Product', url: '/stack', icon: Boxes },
  { id: 'product-evaluations', title: 'Agent Evaluations', category: 'Product', url: '/evaluations', icon: Bot },
  { id: 'product-mcp', title: 'RapidReach MCP', category: 'Product', url: '/mcp', icon: ServerCog },
  { id: 'product-teams', title: 'RapidReach Teams', category: 'Product', url: '/teams', icon: Users },
  { id: 'nav-learning', title: 'Learning Paths', category: 'Navigation', url: '/learning-paths', icon: BookOpen },
  { id: 'nav-blog', title: 'All Articles', category: 'Navigation', url: '/blog', icon: FileText },
]

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [filteredItems, setFilteredItems] = useState(staticItems)
  const [isSearching, setIsSearching] = useState(false)
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }
    const handleOpen = () => setOpen(true)
    document.addEventListener('keydown', down)
    document.addEventListener('open-command-palette', handleOpen)
    return () => {
      document.removeEventListener('keydown', down)
      document.removeEventListener('open-command-palette', handleOpen)
    }
  }, [])

  useEffect(() => {
    if (!search) {
      setFilteredItems(staticItems)
      setIsSearching(false)
      return
    }

    const local = staticItems.filter((item) => `${item.title} ${item.category}`.toLowerCase().includes(search.toLowerCase()))
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    setIsSearching(true)

    searchTimerRef.current = setTimeout(async () => {
      try {
        const results = await searchPosts(search, 5)
        const articles: CommandItem[] = results.map((post: { id: string; title: string; slug: string }) => ({
          id: `post-${post.id}`,
          title: post.title,
          category: 'Articles',
          url: `/blog/${post.slug}`,
          icon: FileText,
        }))
        setFilteredItems([...local, ...articles])
      } catch {
        setFilteredItems(local)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    setFilteredItems(local)
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current) }
  }, [search])

  const select = useCallback((url: string) => {
    setOpen(false)
    setSearch('')
    router.push(url)
  }, [router])

  if (!open) return null

  return (
    <>
      <button type="button" className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={() => setOpen(false)} aria-label="Close search" />
      <div className="fixed left-1/2 top-[18%] z-50 w-full max-w-xl -translate-x-1/2 px-4 animate-scale-in">
        <Command className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0a0a0a]/95 shadow-2xl backdrop-blur-2xl" shouldFilter={false}>
          <div className="flex items-center gap-2.5 border-b border-white/[0.05] px-4 py-3.5">
            <Search className="h-4 w-4 text-zinc-600" />
            <Command.Input value={search} onValueChange={setSearch} placeholder="Search RapidReach intelligence and knowledge..." className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-zinc-700" />
            <button type="button" onClick={() => setOpen(false)} className="rounded-md p-1 hover:bg-white/[0.05]"><X className="h-4 w-4 text-zinc-600" /></button>
          </div>
          <Command.List className="max-h-[390px] overflow-y-auto p-2">
            {filteredItems.length === 0 && !isSearching && <Command.Empty className="py-8 text-center text-xs text-zinc-600">No results found.</Command.Empty>}
            {isSearching && <div className="py-4 text-center text-[11px] text-zinc-700">Searching knowledge…</div>}
            {['Product', 'Navigation', 'Articles'].map((category) => {
              const items = filteredItems.filter((item) => item.category === category)
              if (!items.length) return null
              return <Command.Group key={category} heading={category}><div className="px-2 py-1.5 text-[9px] font-semibold uppercase tracking-widest text-zinc-700">{category}</div>{items.map((item) => { const Icon = item.icon; return <Command.Item key={item.id} value={item.title} onSelect={() => select(item.url)} className="group"><div className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-white/[0.04]"><span className="grid h-8 w-8 place-items-center rounded-lg border border-white/[0.05] bg-white/[0.02]"><Icon className="h-3.5 w-3.5 text-zinc-600 group-hover:text-electric-cyan" /></span><span className="flex-1 text-sm text-zinc-300 group-hover:text-white">{item.title}</span><kbd className="text-[9px] text-zinc-800">↵</kbd></div></Command.Item> })}</Command.Group>
            })}
          </Command.List>
          <div className="flex items-center justify-between border-t border-white/[0.04] px-4 py-2 text-[9px] text-zinc-700"><span>⌘K anywhere</span><span>{filteredItems.length} results</span></div>
        </Command>
      </div>
    </>
  )
}
