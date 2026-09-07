'use server'

import type { Post } from '@/lib/types/database'
import {
  BUILT_IN_POSTS,
  getBuiltInPostById,
  getBuiltInPostBySlug,
} from '@/lib/content/engineering-catalog'
import {
  getPosts as getDatabasePosts,
  getPostBySlug as getDatabasePostBySlug,
  getPostById as getDatabasePostById,
  getSiteStats as getDatabaseSiteStats,
  searchPosts as searchDatabasePosts,
} from './posts-db'

export * from './posts-db'

type PostOptions = {
  status?: string
  category?: string
  authorId?: string
  featured?: boolean
  trending?: boolean
  limit?: number
  offset?: number
}

const DOMAIN_CATEGORIES: Record<string, string[]> = {
  'Container Orchestration': ['kubernetes', 'docker', 'containers', 'containerd', 'podman'],
  'Infrastructure as Code': ['terraform', 'pulumi', 'cloudformation', 'crossplane', 'iac', 'infrastructure as code'],
  'CI/CD & GitOps': ['cicd', 'ci/cd', 'ci-cd', 'github-actions', 'argocd', 'gitops', 'flux', 'jenkins'],
  'Service Mesh & Networking': ['service-mesh', 'istio', 'envoy', 'cilium', 'linkerd', 'networking'],
  'Cloud Platforms': ['cloud', 'aws', 'gcp', 'azure', 'digitalocean'],
  'Observability & SRE': ['observability', 'prometheus', 'grafana', 'sre', 'monitoring', 'tracing', 'opentelemetry'],
  'Security & Compliance': ['security', 'vault', 'falco', 'opa', 'trivy', 'devsecops', 'rbac'],
  'Platform Engineering': ['platform-engineering', 'platform engineering', 'backstage', 'idp', 'developer-experience', 'developer experience'],
}

function matchesCategory(post: Post, target: string) {
  const normalizedTarget = target.toLowerCase()
  return [post.category, ...(post.categories || [])]
    .filter(Boolean)
    .some((category) => category.toLowerCase() === normalizedTarget || category.toLowerCase().includes(normalizedTarget))
}

function filterBuiltInPosts(options: PostOptions = {}) {
  let posts = [...BUILT_IN_POSTS]

  if (options.status) posts = posts.filter((post) => post.status === options.status)
  if (options.category) posts = posts.filter((post) => matchesCategory(post, options.category!))
  if (options.authorId) posts = posts.filter((post) => post.author_id === options.authorId)
  if (options.featured !== undefined) posts = posts.filter((post) => post.featured === options.featured)
  if (options.trending !== undefined) posts = posts.filter((post) => post.trending === options.trending)

  return posts
}

function mergePosts(databasePosts: Post[], builtInPosts: Post[]) {
  const merged = new Map<string, Post>()
  for (const post of builtInPosts) merged.set(post.slug, post)
  for (const post of databasePosts) merged.set(post.slug, post)
  return Array.from(merged.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

export async function getPosts(options: PostOptions = {}) {
  const databasePosts = await getDatabasePosts(options)

  // Keep admin/draft listing semantics unchanged. Built-in editorial content is a public
  // baseline and should appear only in published/public queries.
  const includeBuiltIn =
    options.status === 'published' ||
    options.featured !== undefined ||
    options.trending !== undefined

  if (!includeBuiltIn) return databasePosts

  const merged = mergePosts(databasePosts, filterBuiltInPosts({ ...options, limit: undefined, offset: undefined }))
  const offset = options.offset ?? 0
  const limit = options.limit ?? merged.length
  return merged.slice(offset, offset + limit)
}

export async function getPostBySlug(slug: string) {
  const databasePost = await getDatabasePostBySlug(slug)
  return databasePost ?? getBuiltInPostBySlug(slug)
}

export async function getPostById(id: string) {
  const builtIn = getBuiltInPostById(id)
  if (builtIn) return builtIn
  return getDatabasePostById(id)
}

export async function searchPosts(query: string, limit = 5) {
  const sanitizedQuery = query.trim().replace(/[<>"';\\]/g, '')
  if (!sanitizedQuery) return [] as Post[]
  if (sanitizedQuery.length > 100) throw new Error('Search query is too long')

  const cappedLimit = Math.min(Math.max(limit, 1), 50)
  const databasePosts = await searchDatabasePosts(sanitizedQuery, cappedLimit)
  const needle = sanitizedQuery.toLowerCase()
  const builtInPosts = BUILT_IN_POSTS.filter((post) =>
    [post.title, post.excerpt, post.content, post.category, ...(post.categories || []), ...(post.tags || [])]
      .join(' ')
      .toLowerCase()
      .includes(needle)
  )

  return mergePosts(databasePosts, builtInPosts).slice(0, cappedLimit)
}

export async function getSiteStats() {
  const databaseStats = await getDatabaseSiteStats()
  const builtInDomainCounts: Record<string, number> = {}

  for (const [domain, needles] of Object.entries(DOMAIN_CATEGORIES)) {
    builtInDomainCounts[domain] = BUILT_IN_POSTS.filter((post) => {
      const categories = [post.category, ...(post.categories || []), ...(post.tags || [])]
        .filter(Boolean)
        .map((value) => value.toLowerCase())
      return needles.some((needle) => categories.some((value) => value.includes(needle)))
    }).length
  }

  const domainCounts: Record<string, number> = { ...databaseStats.domainCounts }
  for (const [domain, count] of Object.entries(builtInDomainCounts)) {
    domainCounts[domain] = (domainCounts[domain] || 0) + count
  }

  return {
    totalPosts: databaseStats.totalPosts + BUILT_IN_POSTS.length,
    totalUsers: databaseStats.totalUsers,
    domainCounts,
  }
}
