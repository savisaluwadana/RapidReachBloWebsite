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

// Demo news feed for when Supabase is not configured
function getDemoNewsFeed(): NewsFeedItem[] {
  const now = new Date()
  return [
    {
      id: 'news-1',
      title: 'Kubernetes 1.30 Released with Enhanced Security Features',
      description: 'The latest Kubernetes release brings improved security controls and performance optimizations.',
      source: 'CNCF',
      url: 'https://kubernetes.io/blog',
      category: 'kubernetes',
      announcement_date: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      tags: ['kubernetes', 'release', 'security'],
      is_breaking: true,
      upvote_count: 0,
      view_count: 0,
      created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'news-2',
      title: 'GitHub Actions Introduces Larger Runners for Enterprise',
      description: 'New runner sizes with up to 64 cores and 256GB RAM now available for GitHub Enterprise customers.',
      source: 'GitHub',
      url: 'https://github.blog',
      category: 'ci_cd',
      announcement_date: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
      tags: ['github', 'ci-cd', 'devops'],
      is_breaking: false,
      upvote_count: 0,
      view_count: 0,
      created_at: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'news-3',
      title: 'Terraform 1.8 Adds Native Support for Complex Validation Rules',
      description: 'HashiCorp announces enhanced variable validation capabilities in the latest Terraform release.',
      source: 'HashiCorp',
      url: 'https://hashicorp.com/blog',
      category: 'terraform',
      announcement_date: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(),
      tags: ['terraform', 'infrastructure', 'iac'],
      is_breaking: false,
      upvote_count: 0,
      view_count: 0,
      created_at: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'news-4',
      title: 'Docker Desktop 4.28 Brings Performance Improvements',
      description: 'Faster container startup times and reduced memory usage in the latest Docker Desktop update.',
      source: 'Docker',
      url: 'https://docker.com/blog',
      category: 'cloud_native',
      announcement_date: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
      tags: ['docker', 'containers', 'performance'],
      is_breaking: false,
      upvote_count: 0,
      view_count: 0,
      created_at: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'news-5',
      title: 'Argo CD v2.10 Enhances GitOps Capabilities',
      description: 'New features include improved rollback mechanisms and better multi-cluster support.',
      source: 'Argo Project',
      url: 'https://argo-cd.readthedocs.io',
      category: 'cloud_native',
      announcement_date: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      tags: ['argocd', 'gitops', 'kubernetes'],
      is_breaking: true,
      upvote_count: 0,
      view_count: 0,
      created_at: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'news-6',
      title: 'AWS Announces New EC2 Instance Types for ML Workloads',
      description: 'Optimized instances with latest NVIDIA GPUs for machine learning and AI applications.',
      source: 'AWS',
      url: 'https://aws.amazon.com/blogs',
      category: 'cloud_native',
      announcement_date: new Date(now.getTime() - 36 * 60 * 60 * 1000).toISOString(),
      tags: ['aws', 'cloud', 'ml'],
      is_breaking: false,
      upvote_count: 0,
      view_count: 0,
      created_at: new Date(now.getTime() - 36 * 60 * 60 * 1000).toISOString()
    }
  ]
}

export async function getNewsFeed(options?: {
  category?: string
  featured?: boolean
  limit?: number
}) {
  const supabase = await createClient()
  
  if (!supabase) {
    console.warn('⚠️  Supabase not configured. Returning demo news feed.')
    let filtered = getDemoNewsFeed()
    
    if (options?.category) filtered = filtered.filter(item => item.category === options.category)
    if (options?.featured) filtered = filtered.filter(item => item.is_breaking)
    if (options?.limit) filtered = filtered.slice(0, options.limit)
    
    return filtered
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
    return data as NewsFeedItem[]
  } catch (error) {
    console.error('Error fetching news feed:', error)
    return getDemoNewsFeed()
  }
}

export async function getNewsFeedById(id: string) {
  const supabase = await createClient()
  
  if (!supabase) {
    return getDemoNewsFeed().find(item => item.id === id) || null
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
