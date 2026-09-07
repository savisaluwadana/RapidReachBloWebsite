import { createServiceRoleClient } from '@/lib/supabase/server'
import { PLAN_LIMITS, type OrganizationPlan } from '@/lib/rapidreach/platform-types'

export async function recordUsage(input: {
  organizationId: string
  userId?: string | null
  meter: string
  quantity?: number
  idempotencyKey?: string
  metadata?: Record<string, unknown>
}) {
  const service = createServiceRoleClient()
  if (!service) return
  const { error } = await service.from('usage_events').insert({
    organization_id: input.organizationId,
    user_id: input.userId ?? null,
    meter: input.meter,
    quantity: Math.max(1, Math.round(input.quantity ?? 1)),
    idempotency_key: input.idempotencyKey ?? null,
    metadata: input.metadata ?? {},
  })
  if (error && !error.message.toLowerCase().includes('duplicate')) throw error
}

export async function monthlyUsage(organizationId: string, meter: string) {
  const service = createServiceRoleClient()
  if (!service) return 0
  const now = new Date()
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()
  const { data, error } = await service
    .from('usage_events')
    .select('quantity')
    .eq('organization_id', organizationId)
    .eq('meter', meter)
    .gte('occurred_at', start)
  if (error) throw error
  return (data ?? []).reduce((sum, item) => sum + Number(item.quantity ?? 0), 0)
}

export async function mcpQuota(organizationId: string, plan: OrganizationPlan) {
  const used = await monthlyUsage(organizationId, 'mcp_requests')
  const limit = PLAN_LIMITS[plan].monthlyMcpCalls
  return { used, limit, allowed: used < limit, remaining: Math.max(0, limit - used) }
}
