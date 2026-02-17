// Database Types - Auto-generated from Supabase Schema

export type UserRole = 'reader' | 'contributor' | 'editor' | 'admin'
export type PostStatus = 'draft' | 'pending' | 'published' | 'archived' | 'rejected'
export type CommentStatus = 'pending' | 'approved' | 'rejected' | 'flagged'
export type ContentDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert'

export interface UserProfile {
  id: string
  email: string
  full_name: string
  username: string
  role: UserRole
  bio?: string
  avatar_url?: string
  location?: string
  website_url?: string
  github_url?: string
  twitter_url?: string
  linkedin_url?: string
  preferred_topics?: string[]
  is_active: boolean
  is_verified: boolean
  email_verified_at?: string
  last_login_at?: string
  last_active_at?: string
  email_notifications: boolean
  comment_notifications: boolean
  newsletter_subscribed: boolean
  posts_written: number
  comments_posted: number
  total_views_received: number
  total_likes_received: number
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image_url?: string
  author_id: string
  author?: UserProfile
  category: string
  tags: string[]
  difficulty: ContentDifficulty
  status: PostStatus
  featured: boolean
  trending: boolean
  view_count: number
  unique_view_count: number
  like_count: number
  comment_count: number
  share_count: number
  bookmark_count: number
  estimated_read_time: number
  word_count: number
  character_count: number
  completion_rate?: number
  avg_reading_time?: number
  submitted_at?: string
  approved_at?: string
  approved_by?: string
  rejected_at?: string
  rejected_by?: string
  rejection_reason?: string
  published_at?: string
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  post_id: string
  post?: Post
  author_id: string
  author?: UserProfile
  parent_comment_id?: string
  content: string
  status: CommentStatus
  is_flagged: boolean
  flag_count: number
  flag_reasons?: string[]
  like_count: number
  reply_count: number
  is_spam: boolean
  spam_score?: number
  moderated_at?: string
  moderated_by?: string
  moderation_notes?: string
  created_at: string
  updated_at: string
  replies?: Comment[]
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  link?: string
  related_post_id?: string
  related_comment_id?: string
  related_user_id?: string
  is_read: boolean
  read_at?: string
  created_at: string
}

export interface NewsFeed {
  id: string
  category: string
  title: string
  description: string
  source_url?: string
  is_breaking: boolean
  tags: string[]
  announcement_date: string
  created_at: string
}

export interface LearningPath {
  id: string
  title: string
  slug: string
  description: string
  cover_image_url?: string
  difficulty: ContentDifficulty
  estimated_duration?: number
  category: string
  modules: Array<{
    title: string
    description: string
    post_ids: string[]
    order: number
  }>
  prerequisites: string[]
  learning_outcomes: string[]
  created_by?: string
  enrollment_count: number
  completion_rate: number
  average_rating: number
  is_published: boolean
  featured: boolean
  created_at: string
  updated_at: string
}

export interface AnalyticsSummary {
  id: string
  date: string
  total_views: number
  unique_visitors: number
  total_posts_published: number
  total_comments: number
  total_signups: number
  total_likes: number
  total_shares: number
  total_bookmarks: number
  top_posts: any[]
  top_authors: any[]
  traffic_sources: Record<string, number>
  created_at: string
  updated_at: string
}

export interface AdminActivityLog {
  id: string
  admin_id: string
  admin?: UserProfile
  action: string
  resource_type: string
  resource_id: string
  details: Record<string, any>
  ip_address?: string
  created_at: string
}
