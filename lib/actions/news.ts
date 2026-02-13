'use server'

import { createClient } from '@/lib/supabase/server'

export interface NewsFeedItem {
  id: string
  title: string
  description: string
  source: string
  url?: string
  category: string
  announcement_date: string
  image_url?: string
  tags: string[]
  is_breaking: boolean
  release_version?: string
  severity?: string
  changelog_url?: string
  upvote_count: number
  view_count: number
  created_at: string
  // Computed property for backwards compatibility
  published_at?: string
  is_featured?: boolean
}

export async function getNewsFeed(options?: {
  category?: string
  featured?: boolean
  limit?: number
}) {
  const supabase = await createClient()
  
  if (!supabase) {
    console.warn('⚠️  Supabase not configured. Check SETUP_GUIDE.md.')
    return []
  }

  try {
    let query = supabase
      .from('news_feed')
      .select('*')
      .order('announcement_date', { ascending: false })

    if (options?.category) query = query.eq('category', options.category)
    if (options?.featured) query = query.eq('is_breaking', true)
    if (options?.limit) query = query.limit(options.limit)

    const { data, error } = await query

    if (error) throw error
    
    return (data || []) as NewsFeedItem[]
  } catch (error) {
    console.error('Error fetching news feed:', error)
    return []
  }
}

export async function getNewsFeedById(id: string) {
  const supabase = await createClient()
  
  if (!supabase) {
    return null
  }

  try {
    const { data, error } = await supabase
      .from('news_feed')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as NewsFeedItem
  } catch (error) {
    console.error('Error fetching news item:', error)
    return null
  }
}
