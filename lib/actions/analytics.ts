'use server'

import { createClient } from '@/lib/supabase/server'
import { AnalyticsSummary } from '@/lib/types/database'

export async function getAnalyticsSummary(days: number = 7) {
  const supabase = await createClient()
  
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  const { data, error } = await supabase
    .from('analytics_summary')
    .select('*')
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching analytics:', error)
    return []
  }

  return data as AnalyticsSummary[]
}

export async function getDashboardStats() {
  const supabase = await createClient()
  
  // Get total posts
  const { count: totalPosts } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')

  // Get total users
  const { count: totalUsers } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  // Get total comments
  const { count: totalComments } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')

  // Get pending posts
  const { count: pendingPosts } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  // Get flagged comments
  const { count: flaggedComments } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('is_flagged', true)

  // Get total views (sum of all posts)
  const { data: viewsData } = await supabase
    .from('posts')
    .select('view_count')
    .eq('status', 'published')

  const totalViews = viewsData?.reduce((sum: number, post: any) => sum + (post.view_count || 0), 0) || 0

  return {
    totalPosts: totalPosts || 0,
    totalUsers: totalUsers || 0,
    totalComments: totalComments || 0,
    totalViews,
    pendingPosts: pendingPosts || 0,
    flaggedComments: flaggedComments || 0,
  }
}

export async function getTopPosts(limit: number = 5) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      slug,
      view_count,
      like_count,
      comment_count,
      author:user_profiles!posts_author_id_fkey(full_name)
    `)
    .eq('status', 'published')
    .order('view_count', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching top posts:', error)
    return []
  }

  return data
}

export async function getRecentActivity(limit: number = 10) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('admin_activity_log')
    .select(`
      *,
      admin:user_profiles(full_name, email)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching recent activity:', error)
    return []
  }

  return data
}

export async function getUserGrowthData(months: number = 6) {
  const supabase = await createClient()
  
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - months)
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('created_at')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching user growth:', error)
    return []
  }

  // Group by month
  const monthlyData: Record<string, number> = {}
  
  data?.forEach((user: any) => {
    const month = new Date(user.created_at).toLocaleDateString('en-US', { month: 'short' })
    monthlyData[month] = (monthlyData[month] || 0) + 1
  })

  return Object.entries(monthlyData).map(([month, count]) => ({
    month,
    users: count,
  }))
}

export async function getTrafficSources() {
  const supabase = await createClient()
  
  // Get latest analytics summary
  const { data, error } = await supabase
    .from('analytics_summary')
    .select('traffic_sources')
    .order('date', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) {
    return {
      Direct: 0,
      Google: 0,
      Social: 0,
      GitHub: 0,
      Other: 0,
    }
  }

  return data.traffic_sources as Record<string, number>
}
