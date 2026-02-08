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
  
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
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
  
  const { data: user } = await supabase
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
