'use server'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { UserProfile } from '@/lib/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a Supabase client for auth operations
const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

export async function signUp(email: string, password: string, fullName: string) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (authError) {
    throw authError
  }

  // Create user profile
  if (authData.user) {
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert([{
        id: authData.user.id,
        email,
        full_name: fullName,
        username: email.split('@')[0],
        role: 'reader',
      }])

    if (profileError) {
      throw profileError
    }
  }

  return authData
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  // Update last login
  if (data.user) {
    await supabase
      .from('user_profiles')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', data.user.id)
  }

  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    throw error
  }

  const cookieStore = await cookies()
  cookieStore.delete('sb-access-token')
  cookieStore.delete('sb-refresh-token')
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile as UserProfile | null
}

export async function isAuthenticated(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  return !!user
}

export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === 'admin'
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    throw error
  }
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
  })

  if (error) {
    throw error
  }
}
