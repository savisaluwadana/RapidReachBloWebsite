import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { searchKnowledge } from '@/lib/rapidreach/knowledge/index'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { query?: string; organizationId?: string; limit?: number; semantic?: boolean }
    const query = body.query?.trim() ?? ''
    if (!query || query.length > 500) return NextResponse.json({ error: 'query must be 1-500 characters' }, { status: 400 })

    let organizationId: string | null = null
    if (body.organizationId) {
      const supabase = await createClient()
      if (!supabase) return NextResponse.json({ error: 'Authentication unavailable' }, { status: 503 })
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      const { data: membership } = await supabase
        .from('organization_members')
        .select('id')
        .eq('organization_id', body.organizationId)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle()
      if (!membership) return NextResponse.json({ error: 'Organization access denied' }, { status: 403 })
      organizationId = body.organizationId
    }

    const results = await searchKnowledge({ query, organizationId, limit: body.limit, semantic: body.semantic })
    return NextResponse.json({ results, mode: body.semantic && process.env.RAPIDREACH_EMBEDDING_URL ? 'semantic' : 'full-text' }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Knowledge search failed', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Knowledge search failed' }, { status: 500 })
  }
}
