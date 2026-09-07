import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const next = request.nextUrl.searchParams.get('next') ?? '/'
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/'
  if (!code) return NextResponse.redirect(new URL('/auth/signin?error=missing_code', request.url))
  const supabase = await createClient()
  if (!supabase) return NextResponse.redirect(new URL('/auth/signin?error=auth_unavailable', request.url))
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) return NextResponse.redirect(new URL(`/auth/signin?error=${encodeURIComponent(error.message)}`, request.url))
  return NextResponse.redirect(new URL(safeNext, request.url))
}
