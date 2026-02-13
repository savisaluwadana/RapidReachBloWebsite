'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { UserProfile } from '@/lib/types/database'
import { redirect } from 'next/navigation'
import { checkRateLimit, RATE_LIMITS } from '@/lib/utils/rate-limit'

// Input validation helper
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' }
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain lowercase letters' }
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain uppercase letters' }
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain numbers' }
  }
  return { valid: true }
}

function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>"']/g, '')
}

export async function signUp(email: string, password: string, fullName: string) {
  const supabase = await createClient()
  
  if (!supabase) {
    throw new Error('Supabase client not configured')
  }

  // Validate inputs
  if (!validateEmail(email)) {
    throw new Error('Invalid email address')
  }

  const passwordValidation = validatePassword(password)
  if (!passwordValidation.valid) {
    throw new Error(passwordValidation.message || 'Invalid password')
  }

  const sanitizedName = sanitizeInput(fullName)
  if (!sanitizedName || sanitizedName.length < 2) {
    throw new Error('Name must be at least 2 characters')
  }

  const sanitizedEmail = email.trim().toLowerCase()

  // Rate limit check
  const rateLimitKey = `signup:${sanitizedEmail}`
  const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.SIGNUP)
  if (!rateLimit.allowed) {
    throw new Error(`Too many signup attempts. Please try again in ${rateLimit.retryAfter} seconds.`)
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: sanitizedEmail,
    password,
    options: {
      data: {
        full_name: sanitizedName,
      },
    },
  })

  if (authError) {
    throw authError
  }

  // Create user profile
  if (authData.user) {
    const username = sanitizedEmail.split('@')[0].replace(/[^a-z0-9_-]/gi, '').toLowerCase()
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert([{
        id: authData.user.id,
        email: sanitizedEmail,
        full_name: sanitizedName,
        username: username || `user_${authData.user.id.substring(0, 8)}`,
        role: 'reader',
      }])

    if (profileError) {
      throw profileError
    }
  }

  return authData
}

export async function signIn(email: string, password: string) {
  const supabase = await createClient()
  
  if (!supabase) {
    throw new Error('Supabase client not configured')
  }

  // Validate email format
  if (!validateEmail(email)) {
    throw new Error('Invalid email address')
  }

  const sanitizedEmail = email.trim().toLowerCase()

  // Rate limit check
  const rateLimitKey = `login:${sanitizedEmail}`
  const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.LOGIN)
  if (!rateLimit.allowed) {
    throw new Error(`Too many login attempts. Please try again in ${rateLimit.retryAfter} seconds.`)
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: sanitizedEmail,
    password,
  })

  if (error) {
    throw error
  }

  // Fetch role and update last login in parallel
  let role = 'reader'
  if (data.user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()
    
    if (profile) {
      role = profile.role
    }

    // Fire-and-forget: update last login
    supabase
      .from('user_profiles')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', data.user.id)
      .then(() => {})
  }

  return { ...data, role }
}

export async function signOut() {
  const supabase = await createClient()
  
  if (!supabase) {
    return
  }

  await supabase.auth.signOut()
  redirect('/auth/signin')
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  const supabase = await createClient()
  
  if (!supabase) {
    return null
  }

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
  const supabase = await createClient()
  
  if (!supabase) {
    return false
  }

  const { data: { user } } = await supabase.auth.getUser()
  return !!user
}

export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === 'admin'
}

export async function updatePassword(newPassword: string) {
  const supabase = await createClient()
  
  if (!supabase) {
    throw new Error('Supabase client not configured')
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    throw error
  }
}

export async function resetPassword(email: string) {
  const supabase = await createClient()
  
  if (!supabase) {
    throw new Error('Supabase client not configured')
  }

  // Validate email
  if (!validateEmail(email)) {
    throw new Error('Invalid email address')
  }

  const sanitizedEmail = email.trim().toLowerCase()

  // Rate limit check
  const rateLimitKey = `password-reset:${sanitizedEmail}`
  const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.PASSWORD_RESET)
  if (!rateLimit.allowed) {
    throw new Error(`Too many password reset attempts. Please try again in ${rateLimit.retryAfter} seconds.`)
  }

  const { error } = await supabase.auth.resetPasswordForEmail(sanitizedEmail, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
  })

  if (error) {
    throw error
  }
}
