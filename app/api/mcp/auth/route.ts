import { createHash } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { mcpQuota, recordUsage } from '@/lib/rapidreach/metering'
import type { OrganizationPlan } from '@/lib/rapidreach/platform-types'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const authorization = request.headers.get('authorization')
  if (!authorization?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing API key' }, { status: 401 })
  }
  const token = authorization.slice('Bearer '.length).trim()
  if (!token.startsWith('rr_live_') || token.length < 32) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
  }

  const service = createServiceRoleClient()
  if (!service) return NextResponse.json({ error: 'Authentication service unavailable' }, { status: 503 })
  const keyHash = createHash('sha256').update(token).digest('hex')
  const { data: apiKey, error } = await service
    .from('api_keys')
    .select('id, organization_id, scopes, expires_at, revoked_at, organizations(plan)')
    .eq('key_hash', keyHash)
    .maybeSingle()

  if (error || !apiKey || apiKey.revoked_at) return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
  if (apiKey.expires_at && new Date(apiKey.expires_at).getTime() <= Date.now()) {
    return NextResponse.json({ error: 'API key expired' }, { status: 401 })
  }

  const rawOrganization = apiKey.organizations
  const organization = !rawOrganization || Array.isArray(rawOrganization) ? null : rawOrganization as { plan?: string }
  const plan = (organization?.plan ?? 'free') as OrganizationPlan
  const quota = await mcpQuota(String(apiKey.organization_id), plan)
  if (!quota.allowed) {
    return NextResponse.json({ error: 'MCP monthly quota exceeded', quota }, { status: 429 })
  }

  await Promise.all([
    service.from('api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', apiKey.id),
    recordUsage({
      organizationId: String(apiKey.organization_id),
      meter: 'mcp_requests',
      metadata: { keyId: apiKey.id, userAgent: request.headers.get('user-agent') ?? undefined },
    }),
  ])

  return NextResponse.json({
    active: true,
    organizationId: String(apiKey.organization_id),
    scopes: Array.isArray(apiKey.scopes) ? apiKey.scopes : [],
    plan,
    quota: { ...quota, used: quota.used + 1, remaining: Math.max(0, quota.remaining - 1) },
  }, { headers: { 'Cache-Control': 'no-store' } })
}
