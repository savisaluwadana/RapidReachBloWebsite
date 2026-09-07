import type { Post } from '@/lib/types/database'
import {
  getPosts as getDatabasePosts,
  getPostBySlug as getDatabasePostBySlug,
  getSiteStats as getDatabaseSiteStats,
  searchPosts as searchDatabasePosts,
} from '@/lib/actions/posts-db'
import { getLearningPaths, getLearningPathBySlug, type LearningPath } from '@/lib/actions/learning-paths'
import {
  BUILT_IN_POSTS,
  BUILT_IN_LEARNING_PATHS,
  getBuiltInPostBySlug,
  getBuiltInPostsByIds,
} from '@/lib/content/engineering-catalog'

type PostOptions = {
  status?: string
  category?: string
  authorId?: string
  featured?: boolean
  trending?: boolean
  limit?: number
  offset?: number
}

type LearningPathOptions = {
  featured?: boolean
  difficulty?: string
  category?: string
  limit?: number
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

function filterBuiltInPosts(options: PostOptions = {}) {
  let posts = [...BUILT_IN_POSTS]

  if (options.status) posts = posts.filter((post) => post.status === options.status)
  if (options.category) {
    const target = options.category.toLowerCase()
    posts = posts.filter((post) =>
      [post.category, ...(post.categories || [])]
        .map((category) => category.toLowerCase())
        .some((category) => category === target || category.includes(target))
    )
  }
  if (options.authorId) posts = posts.filter((post) => post.author_id === options.authorId)
  if (options.featured !== undefined) posts = posts.filter((post) => post.featured === options.featured)
  if (options.trending !== undefined) posts = posts.filter((post) => post.trending === options.trending)

  const offset = options.offset ?? 0
  const limit = options.limit ?? posts.length
  return posts.slice(offset, offset + limit)
}

function mergePosts(databasePosts: Post[], builtInPosts: Post[]) {
  const merged = new Map<string, Post>()
  for (const post of builtInPosts) merged.set(post.slug, post)
  for (const post of databasePosts) merged.set(post.slug, post)

  return Array.from(merged.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

export async function getContentPosts(options: PostOptions = {}): Promise<Post[]> {
  const databasePosts = await getDatabasePosts(options)
  const builtInPosts = filterBuiltInPosts({ ...options, limit: undefined, offset: undefined })
  const posts = mergePosts(databasePosts, builtInPosts)

  const offset = options.offset ?? 0
  const limit = options.limit ?? posts.length
  return posts.slice(offset, offset + limit)
}

export async function getContentPostBySlug(slug: string): Promise<Post | null> {
  const databasePost = await getDatabasePostBySlug(slug)
  return databasePost ?? getBuiltInPostBySlug(slug)
}

export async function searchContentPosts(query: string, limit = 8): Promise<Post[]> {
  const sanitizedQuery = query.trim().replace(/[<>"';\\]/g, '')
  if (!sanitizedQuery) return []
  if (sanitizedQuery.length > 100) return []

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

export async function getContentSiteStats() {
  const databaseStats = await getDatabaseSiteStats()
  const builtInDomainCounts: Record<string, number> = {}

  for (const [domain, needles] of Object.entries(DOMAIN_CATEGORIES)) {
    builtInDomainCounts[domain] = BUILT_IN_POSTS.filter((post) => {
      const values = [post.category, ...(post.categories || []), ...(post.tags || [])]
        .filter(Boolean)
        .map((value) => value.toLowerCase())
      return needles.some((needle) => values.some((value) => value.includes(needle)))
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

export async function getContentLearningPaths(options: LearningPathOptions = {}): Promise<LearningPath[]> {
  const databasePaths = await getLearningPaths(options)
  let builtIn = [...BUILT_IN_LEARNING_PATHS] as LearningPath[]

  if (options.featured) builtIn = builtIn.filter((path) => path.featured)
  if (options.difficulty) builtIn = builtIn.filter((path) => path.difficulty === options.difficulty)
  if (options.category) builtIn = builtIn.filter((path) => path.category === options.category)

  const merged = new Map<string, LearningPath>()
  for (const path of builtIn) merged.set(path.slug, path)
  for (const path of databasePaths) merged.set(path.slug, path)

  const paths = Array.from(merged.values())
  return options.limit ? paths.slice(0, options.limit) : paths
}

export async function getContentLearningPathBySlug(slug: string): Promise<LearningPath | null> {
  const databasePath = await getLearningPathBySlug(slug)
  const builtIn = BUILT_IN_LEARNING_PATHS.find((path) => path.slug === slug) as LearningPath | undefined

  if (databasePath && !databasePath.id.startsWith('demo-lp-')) return databasePath
  return builtIn ?? databasePath ?? null
}

export function getContentPostsByIds(postIds: string[]): Post[] {
  return getBuiltInPostsByIds(postIds)
}

export function getBuiltInContentStats() {
  const categories = new Set(BUILT_IN_POSTS.flatMap((post) => post.categories || []))
  return {
    articles: BUILT_IN_POSTS.length,
    learningPaths: BUILT_IN_LEARNING_PATHS.length,
    categories: categories.size,
  }
}
