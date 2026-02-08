import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️  Supabase environment variables are not set. Using demo mode.')
    console.warn('Create a .env.local file with your Supabase credentials.')
    // Return a mock client that won't crash
    return null as any
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
