import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  let response = NextResponse.next()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return response
  }

  // Create Supabase client for session management
  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Refresh session
  const { data: { user } } = await supabase.auth.getUser()

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
    
    // Check if user has admin/editor role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (!profile || (profile.role !== 'admin' && profile.role !== 'editor')) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*']
}
