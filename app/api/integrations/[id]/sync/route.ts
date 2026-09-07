import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { syncIntegration } from '@/lib/rapidreach/integrations/sync'

export const runtime = 'nodejs'
export const maxDuration = 180

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: 'Invalid integration id' }, { status: 400 })

    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ error: 'Authentication unavailable' }, { status: 503 })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

    const { data: integration } = await supabase
      .from('integration_connections')
      .select('organization_id')
      .eq('id', id)
      .maybeSingle()
    if (!integration) return NextResponse.json({ error: 'Integration not found' }, { status: 404 })

    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', integration.organization_id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle()
    if (!membership || !['owner', 'admin', 'member'].includes(String(membership.role))) {
      return NextResponse.json({ error: 'Organization member access required' }, { status: 403 })
    }

    const result = await syncIntegration(id)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Integration sync failed', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Integration sync failed' }, { status: 500 })
  }
}
