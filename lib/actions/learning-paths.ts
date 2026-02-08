'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface LearningPath {
  id: string
  title: string
  slug: string
  description: string
  cover_image_url?: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
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

export interface LearningPathProgress {
  id: string
  user_id: string
  learning_path_id: string
  completed_modules: number[]
  current_module: number
  progress_percentage: number
  started_at: string
  last_accessed_at: string
  completed_at?: string
}

// Demo learning paths for when Supabase is not configured
function getDemoLearningPaths(): LearningPath[] {
  return [
    {
      id: 'demo-lp-1',
      title: 'Kubernetes Fundamentals',
      slug: 'kubernetes-fundamentals',
      description: 'Master the basics of Kubernetes from container orchestration to deployment strategies',
      difficulty: 'beginner',
      estimated_duration: 320, // 8 weeks * 40 hours
      category: 'Kubernetes',
      modules: [
        { title: 'Pods & Deployments', description: 'Learn core Kubernetes resources', post_ids: [], order: 1 },
        { title: 'Services & Networking', description: 'Master Kubernetes networking', post_ids: [], order: 2 },
        { title: 'ConfigMaps & Secrets', description: 'Manage application configuration', post_ids: [], order: 3 },
        { title: 'Persistent Storage', description: 'Work with volumes and storage', post_ids: [], order: 4 }
      ],
      prerequisites: ['Docker basics', 'Linux fundamentals'],
      learning_outcomes: ['Deploy applications to Kubernetes', 'Manage cluster resources', 'Debug common issues'],
      enrollment_count: 2450,
      completion_rate: 78.5,
      average_rating: 4.7,
      is_published: true,
      featured: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'demo-lp-2',
      title: 'Platform Engineering Mastery',
      slug: 'platform-engineering-mastery',
      description: 'Build and scale internal developer platforms with modern tools and practices',
      difficulty: 'advanced',
      estimated_duration: 480, // 12 weeks * 40 hours
      category: 'Platform Engineering',
      modules: [
        { title: 'IDP Design', description: 'Design internal developer platforms', post_ids: [], order: 1 },
        { title: 'Developer Experience', description: 'Optimize developer workflows', post_ids: [], order: 2 },
        { title: 'Self-Service Platforms', description: 'Enable team autonomy', post_ids: [], order: 3 },
        { title: 'GitOps Workflows', description: 'Implement GitOps patterns', post_ids: [], order: 4 }
      ],
      prerequisites: ['Kubernetes experience', 'CI/CD knowledge', 'Cloud platforms'],
      learning_outcomes: ['Design scalable platforms', 'Implement self-service', 'Measure platform success'],
      enrollment_count: 1200,
      completion_rate: 65.3,
      average_rating: 4.9,
      is_published: true,
      featured: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'demo-lp-3',
      title: 'CI/CD Pipeline Excellence',
      slug: 'cicd-pipeline-excellence',
      description: 'Design, implement, and optimize continuous integration and delivery pipelines',
      difficulty: 'intermediate',
      estimated_duration: 240, // 6 weeks * 40 hours
      category: 'CI/CD',
      modules: [
        { title: 'Pipeline Design', description: 'Architect effective pipelines', post_ids: [], order: 1 },
        { title: 'Testing Automation', description: 'Implement comprehensive testing', post_ids: [], order: 2 },
        { title: 'Deployment Strategies', description: 'Master deployment patterns', post_ids: [], order: 3 },
        { title: 'Security Scanning', description: 'Integrate security checks', post_ids: [], order: 4 }
      ],
      prerequisites: ['Git fundamentals', 'Basic scripting'],
      learning_outcomes: ['Build robust pipelines', 'Automate deployments', 'Implement security'],
      enrollment_count: 3100,
      completion_rate: 82.1,
      average_rating: 4.6,
      is_published: true,
      featured: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
}

// =====================================================
// LEARNING PATH ACTIONS
// =====================================================

export async function getLearningPaths(options?: {
  featured?: boolean
  difficulty?: string
  category?: string
  limit?: number
}) {
  const supabase = await createClient()
  
  if (!supabase) {
    console.warn('⚠️  Supabase not configured. Returning demo learning paths.')
    let filtered = getDemoLearningPaths()
    
    if (options?.featured) filtered = filtered.filter(lp => lp.featured)
    if (options?.difficulty) filtered = filtered.filter(lp => lp.difficulty === options.difficulty)
    if (options?.category) filtered = filtered.filter(lp => lp.category === options.category)
    if (options?.limit) filtered = filtered.slice(0, options.limit)
    
    return filtered
  }

  try {
    let query = supabase
      .from('learning_paths')
      .select('*')
      .eq('is_published', true)

    if (options?.featured) query = query.eq('featured', true)
    if (options?.difficulty) query = query.eq('difficulty', options.difficulty)
    if (options?.category) query = query.eq('category', options.category)
    if (options?.limit) query = query.limit(options.limit)

    query = query.order('enrollment_count', { ascending: false })

    const { data, error } = await query

    if (error) throw error
    return data as LearningPath[]
  } catch (error) {
    console.error('Error fetching learning paths:', error)
    return getDemoLearningPaths()
  }
}

export async function getLearningPathBySlug(slug: string) {
  const supabase = await createClient()
  
  if (!supabase) {
    return getDemoLearningPaths().find(lp => lp.slug === slug) || null
  }

  try {
    const { data, error } = await supabase
      .from('learning_paths')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single()

    if (error) throw error
    return data as LearningPath
  } catch (error) {
    console.error('Error fetching learning path:', error)
    return getDemoLearningPaths().find(lp => lp.slug === slug) || null
  }
}

export async function enrollInLearningPath(userId: string, learningPathId: string) {
  const supabase = await createClient()
  if (!supabase) return { success: false, error: 'Database not configured' }

  try {
    const { data, error } = await supabase
      .from('learning_path_progress')
      .insert({
        user_id: userId,
        learning_path_id: learningPathId,
        completed_modules: [],
        current_module: 0,
        progress_percentage: 0
      })
      .select()
      .single()

    if (error) throw error

    // Increment enrollment count
    await supabase.rpc('increment_enrollment_count', { path_id: learningPathId })

    revalidatePath('/learning-paths')
    return { success: true, data }
  } catch (error: any) {
    console.error('Error enrolling in learning path:', error)
    return { success: false, error: error.message }
  }
}

export async function updateLearningPathProgress(
  userId: string,
  learningPathId: string,
  completedModules: number[],
  currentModule: number
) {
  const supabase = await createClient()
  if (!supabase) return { success: false, error: 'Database not configured' }

  try {
    const progressPercentage = (completedModules.length / currentModule) * 100

    const { data, error } = await supabase
      .from('learning_path_progress')
      .update({
        completed_modules: completedModules,
        current_module: currentModule,
        progress_percentage: progressPercentage,
        last_accessed_at: new Date().toISOString(),
        completed_at: progressPercentage === 100 ? new Date().toISOString() : null
      })
      .eq('user_id', userId)
      .eq('learning_path_id', learningPathId)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/learning-paths')
    return { success: true, data }
  } catch (error: any) {
    console.error('Error updating learning path progress:', error)
    return { success: false, error: error.message }
  }
}

export async function getUserLearningPathProgress(userId: string, learningPathId: string) {
  const supabase = await createClient()
  if (!supabase) return null

  try {
    const { data, error } = await supabase
      .from('learning_path_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('learning_path_id', learningPathId)
      .single()

    if (error) throw error
    return data as LearningPathProgress
  } catch (error) {
    console.error('Error fetching user progress:', error)
    return null
  }
}
