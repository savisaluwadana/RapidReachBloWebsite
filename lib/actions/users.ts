'use server'

import { createClient } from '@/lib/supabase/server'
import { UserProfile } from '@/lib/types/database'
import { revalidatePath } from 'next/cache'

export async function getUsers(options?: {
  role?: string
  isActive?: boolean
  limit?: number
  offset?: number
}) {
  const supabase = await createClient()
  
  let query = supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (options?.role) {
    query = query.eq('role', options.role)
  }
  if (options?.isActive !== undefined) {
    query = query.eq('is_active', options.isActive)
  }
  if (options?.limit) {
    query = query.limit(options.limit)
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching users:', error)
    return []
  }

  return data as UserProfile[]
}

export async function getUserById(id: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching user:', error)
    return null
  }

  return data as UserProfile
}

export async function getUserByEmail(email: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('email', email)
    .single()

  if (error) {
    console.error('Error fetching user:', error)
    return null
  }

  return data as UserProfile
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  const supabase = await createClient()
  
  if (!supabase) {
    throw new Error('Supabase client not configured')
  }

  // Verify user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized: You must be logged in')
  }

  // Only allow users to update their own profile (unless admin)
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isOwnProfile = user.id === userId
  const isAdmin = profile?.role === 'admin'

  if (!isOwnProfile && !isAdmin) {
    throw new Error('Unauthorized: You can only update your own profile')
  }

  // Sanitize and validate updates
  const sanitizedUpdates: any = {}
  
  if (updates.full_name !== undefined) {
    const name = updates.full_name.trim().replace(/[<>"']/g, '')
    if (name.length < 2 || name.length > 100) {
      throw new Error('Name must be between 2 and 100 characters')
    }
    sanitizedUpdates.full_name = name
  }

  if (updates.bio !== undefined) {
    const bio = updates.bio.trim()
    if (bio.length > 500) {
      throw new Error('Bio must be less than 500 characters')
    }
    sanitizedUpdates.bio = bio
  }

  if (updates.website_url !== undefined) {
    const url = updates.website_url.trim()
    if (url && !url.match(/^https?:\/\/.+/)) {
      throw new Error('Invalid website URL')
    }
    sanitizedUpdates.website_url = url
  }

  // Don't allow role changes through this function
  delete sanitizedUpdates.role
  delete sanitizedUpdates.is_active

  sanitizedUpdates.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('user_profiles')
    .update(sanitizedUpdates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating user:', error)
    throw error
  }

  revalidatePath('/admin/users')
  revalidatePath('/profile')
  
  return data as UserProfile
}

export async function updateUserRole(userId: string, role: string, adminId: string) {
  const supabase = await createClient()
  
  if (!supabase) {
    throw new Error('Supabase client not configured')
  }

  // Verify admin is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== adminId) {
    throw new Error('Unauthorized: Authentication mismatch')
  }

  // Verify admin has admin role
  const { data: adminProfile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', adminId)
    .single()

  if (!adminProfile || adminProfile.role !== 'admin') {
    throw new Error('Unauthorized: Admin privileges required')
  }

  // Validate role
  const validRoles = ['reader', 'contributor', 'editor', 'admin']
  if (!validRoles.includes(role)) {
    throw new Error('Invalid role')
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .update({ role })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating user role:', error)
    throw error
  }

  // Log admin action
  await supabase
    .from('admin_activity_log')
    .insert([{
      admin_id: adminId,
      action: 'change_user_role',
      resource_type: 'user',
      resource_id: userId,
      details: { new_role: role }
    }])

  revalidatePath('/admin/users')
  
  return data as UserProfile
}

export async function toggleUserStatus(userId: string, adminId: string) {
  const supabase = await createClient()
  
  if (!supabase) {
    throw new Error('Supabase client not configured')
  }

  // Verify admin is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== adminId) {
    throw new Error('Unauthorized: Authentication mismatch')
  }

  // Verify admin has admin role
  const { data: adminProfile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', adminId)
    .single()

  if (!adminProfile || adminProfile.role !== 'admin') {
    throw new Error('Unauthorized: Admin privileges required')
  }

  // Prevent admin from deactivating themselves
  if (userId === adminId) {
    throw new Error('You cannot deactivate your own account')
  }

  const { data: currentUser } = await supabase
    .from('user_profiles')
    .select('is_active')
    .eq('id', userId)
    .single()

  const newStatus = !user?.is_active
  
  const { data, error } = await supabase
    .from('user_profiles')
    .update({ is_active: newStatus })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error toggling user status:', error)
    throw error
  }

  // Log admin action
  await supabase
    .from('admin_activity_log')
    .insert([{
      admin_id: adminId,
      action: newStatus ? 'activate_user' : 'suspend_user',
      resource_type: 'user',
      resource_id: userId,
      details: { is_active: newStatus }
    }])

  revalidatePath('/admin/users')
  
  return data as UserProfile
}

export async function getUserStats() {
  const supabase = await createClient()
  
  const { count: totalUsers } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })

  const { count: activeUsers } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  const { count: contributors } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .in('role', ['contributor', 'editor', 'admin'])

  return {
    total: totalUsers || 0,
    active: activeUsers || 0,
    contributors: contributors || 0,
  }
}
