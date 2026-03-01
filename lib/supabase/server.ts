import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
    // Return null to trigger demo mode in server actions
    return null as any
  }

  const cookieStore = await cookies()

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

/**
 * A cookie-free Supabase client safe to use inside `unstable_cache`.
 * Only use for unauthenticated read-only queries (public posts, stats, etc.)
 */
export function createCachedClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
    return null as any
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: { getAll: () => [], setAll: () => {} },
  })
}

/**
 * Create a Supabase client using the service role key.
 * This client has elevated privileges and must only be used server-side
 * for trusted maintenance tasks (e.g., logging admin activity).
 */
export function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey || supabaseUrl.includes('placeholder')) {
    return null as any
  }

  return createServerClient(supabaseUrl, supabaseServiceKey, {
    cookies: { getAll: () => [], setAll: () => {} },
  })
}
