import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const domain = request.nextUrl.searchParams.get('domain')?.trim().toLowerCase()
  const providerId = request.nextUrl.searchParams.get('providerId')?.trim()
  const next = request.nextUrl.searchParams.get('next') ?? '/settings/platform'
  if (!domain && !providerId) return NextResponse.redirect(new URL('/auth/signin?error=sso_identifier_required', request.url))
  const supabase = await createClient()
  if (!supabase) return NextResponse.redirect(new URL('/auth/signin?error=auth_unavailable', request.url))
  const callback = new URL('/auth/callback', request.url)
  callback.searchParams.set('next', next.startsWith('/') && !next.startsWith('//') ? next : '/')
  const identifier = providerId ? { providerId } : { domain: domain as string }
  const { data, error } = await supabase.auth.signInWithSSO({
    ...identifier,
    options: { redirectTo: callback.toString() },
  })
  if (error || !data.url) {
    return NextResponse.redirect(new URL(`/auth/signin?error=${encodeURIComponent(error?.message ?? 'sso_failed')}`, request.url))
  }
  return NextResponse.redirect(data.url)
}
