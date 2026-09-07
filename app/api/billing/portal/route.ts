import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createBillingPortal } from '@/lib/rapidreach/billing'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { organizationId?: string }
    if (!body.organizationId) return NextResponse.json({ error: 'organizationId is required' }, { status: 400 })
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ error: 'Billing unavailable' }, { status: 503 })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

    const { data: membership } = await supabase
      .from('organization_members')
      .select('role, organizations(billing_customer_id)')
      .eq('organization_id', body.organizationId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle()
    if (!membership || !['owner', 'admin'].includes(String(membership.role))) {
      return NextResponse.json({ error: 'Organization admin access required' }, { status: 403 })
    }
    const rawOrg = membership.organizations
    const organization = rawOrg && !Array.isArray(rawOrg) ? rawOrg as { billing_customer_id?: string | null } : null
    if (!organization?.billing_customer_id) return NextResponse.json({ error: 'No billing account exists for this organization' }, { status: 400 })
    const portal = await createBillingPortal(organization.billing_customer_id)
    return NextResponse.json({ url: portal.url })
  } catch (error) {
    console.error('Billing portal failed', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Billing portal failed' }, { status: 500 })
  }
}
