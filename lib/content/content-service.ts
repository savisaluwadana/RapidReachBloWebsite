import type { Post } from '@/lib/types/database'
import { getPosts as getDatabasePosts, getPostBySlug as getDatabasePostBySlug } from '@/lib/actions/posts-db'
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

export async function getContentPosts(options: PostOptions = {}): Promise<Post[]> {
  const databasePosts = await getDatabasePosts(options)
  const builtInPosts = filterBuiltInPosts({ ...options, limit: undefined, offset: undefined })

  const merged = new Map<string, Post>()
  for (const post of builtInPosts) merged.set(post.slug, post)
  for (const post of databasePosts) merged.set(post.slug, post)

  const posts = Array.from(merged.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  const offset = options.offset ?? 0
  const limit = options.limit ?? posts.length
  return posts.slice(offset, offset + limit)
}

export async function getContentPostBySlug(slug: string): Promise<Post | null> {
  const databasePost = await getDatabasePostBySlug(slug)
  return databasePost ?? getBuiltInPostBySlug(slug)
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
  const categories = new Set(BUILT_IN_POSTS.flatMap((post) => post.categories))
  return {
    articles: BUILT_IN_POSTS.length,
    learningPaths: BUILT_IN_LEARNING_PATHS.length,
    categories: categories.size,
  }
}
