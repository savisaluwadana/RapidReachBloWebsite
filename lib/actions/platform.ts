'use server'

import { createHash, randomBytes } from 'crypto'
import { revalidatePath } from 'next/cache'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import type {
  IntegrationRecord,
  IntelligenceRecord,
  OrganizationPlan,
  OrganizationRole,
  OrganizationSummary,
  PlatformSnapshot,
  SkillScoreRecord,
  StackComponentRecord,
  UsageSummary,
} from '@/lib/rapidreach/platform-types'

const orgSlugPattern = /^[a-z0-9][a-z0-9-]{1,62}$/

type DbRow = Record<string, unknown>
type OrganizationMembershipRow = {
  role: OrganizationRole | string
  organizations: DbRow | DbRow[] | null
}

async function requireUser() {
  const supabase = await createClient()
  if (!supabase) throw new Error('Supabase is not configured')
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Authentication required')
  return { supabase, user }
}

function mapOrganization(row: DbRow, role: OrganizationRole): OrganizationSummary {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    plan: String(row.plan) as OrganizationPlan,
    billingStatus: String(row.billing_status ?? 'inactive'),
    role,
  }
}

export async function getPlatformOrganizations(): Promise<OrganizationSummary[]> {
  const { supabase, user } = await requireUser()
  const { data: memberships, error } = await supabase
    .from('organization_members')
    .select('organization_id, role, organizations(id, slug, name, plan, billing_status)')
    .eq('user_id', user.id)
    .eq('status', 'active')

  if (error) {
    if (error.message.includes('organization_members')) return []
    throw error
  }

  const typedMemberships = (memberships ?? []) as OrganizationMembershipRow[]
  return typedMemberships.flatMap((membership: OrganizationMembershipRow) => {
    const rawOrg = membership.organizations
    if (!rawOrg || Array.isArray(rawOrg)) return []
    return [mapOrganization(rawOrg, String(membership.role) as OrganizationRole)]
  })
}

export async function createOrganization(input: { name: string; slug: string }) {
  const { supabase, user } = await requireUser()
  const name = input.name.trim()
  const slug = input.slug.trim().toLowerCase()
  if (name.length < 2 || name.length > 100) throw new Error('Organization name must be 2-100 characters')
  if (!orgSlugPattern.test(slug)) throw new Error('Use a lowercase slug with letters, numbers, and hyphens')

  const { data, error } = await supabase
    .from('organizations')
    .insert({ name, slug, created_by: user.id })
    .select('id, slug, name, plan, billing_status')
    .single()

  if (error) throw error
  revalidatePath('/teams')
  revalidatePath('/settings/platform')
  return mapOrganization(data as DbRow, 'owner')
}

export async function getPlatformSnapshot(organizationId: string): Promise<PlatformSnapshot> {
  const { supabase, user } = await requireUser()
  const { data: membership, error: membershipError } = await supabase
    .from('organization_members')
    .select('role, organizations(id, slug, name, plan, billing_status)')
    .eq('organization_id', organizationId)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (membershipError || !membership || !membership.organizations || Array.isArray(membership.organizations)) {
    throw new Error('Organization access denied')
  }

  const [stackResult, signalResult, skillResult, integrationResult, usageResult] = await Promise.all([
    supabase.from('stack_components').select('*').eq('organization_id', organizationId).order('criticality', { ascending: false }),
    supabase.from('intelligence_signals').select('*').or(`organization_id.eq.${organizationId},organization_id.is.null`).order('created_at', { ascending: false }).limit(100),
    supabase.from('user_skill_scores').select('*').eq('user_id', user.id).or(`organization_id.eq.${organizationId},organization_id.is.null`).order('score', { ascending: true }),
    supabase.from('integration_connections').select('*').eq('organization_id', organizationId).order('created_at', { ascending: true }),
    supabase.from('usage_events').select('meter, quantity').eq('organization_id', organizationId).gte('occurred_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
  ])

  const stack: StackComponentRecord[] = ((stackResult.data ?? []) as DbRow[]).map((row: DbRow) => ({
    id: String(row.id),
    organizationId: String(row.organization_id),
    name: String(row.name),
    slug: String(row.slug),
    kind: String(row.kind),
    technology: String(row.technology),
    version: row.version ? String(row.version) : null,
    environment: String(row.environment),
    ownerTeam: row.owner_team ? String(row.owner_team) : null,
    criticality: Number(row.criticality),
    metadata: (row.metadata ?? {}) as Record<string, unknown>,
  }))

  const signals: IntelligenceRecord[] = ((signalResult.data ?? []) as DbRow[]).map((row: DbRow) => ({
    id: String(row.id),
    organizationId: row.organization_id ? String(row.organization_id) : null,
    sourceProvider: String(row.source_provider),
    externalId: String(row.external_id),
    sourceUrl: row.source_url ? String(row.source_url) : null,
    signalType: String(row.signal_type),
    title: String(row.title),
    summary: String(row.summary),
    severity: String(row.severity) as IntelligenceRecord['severity'],
    status: String(row.status) as IntelligenceRecord['status'],
    domain: String(row.domain),
    technology: row.technology ? String(row.technology) : null,
    version: row.version ? String(row.version) : null,
    recommendedAction: row.recommended_action ? String(row.recommended_action) : null,
    publishedAt: row.published_at ? String(row.published_at) : null,
    affectedComponentIds: Array.isArray(row.affected_component_ids) ? row.affected_component_ids.map(String) : [],
    evidence: (row.evidence ?? {}) as Record<string, unknown>,
  }))

  const skills: SkillScoreRecord[] = ((skillResult.data ?? []) as DbRow[]).map((row: DbRow) => ({
    id: String(row.id),
    skillKey: String(row.skill_key),
    skillName: String(row.skill_name),
    domain: String(row.domain),
    score: Number(row.score),
    target: Number(row.target),
    confidence: Number(row.confidence),
    assessedAt: String(row.assessed_at),
  }))

  const integrations: IntegrationRecord[] = ((integrationResult.data ?? []) as DbRow[]).map((row: DbRow) => ({
    id: String(row.id),
    provider: String(row.provider),
    displayName: String(row.display_name),
    status: String(row.status) as IntegrationRecord['status'],
    externalAccountId: row.external_account_id ? String(row.external_account_id) : null,
    config: (row.config ?? {}) as Record<string, unknown>,
    lastSyncedAt: row.last_synced_at ? String(row.last_synced_at) : null,
    lastError: row.last_error ? String(row.last_error) : null,
  }))

  const usageMap = new Map<string, number>()
  for (const row of (usageResult.data ?? []) as DbRow[]) {
    const meter = String(row.meter)
    usageMap.set(meter, (usageMap.get(meter) ?? 0) + Number(row.quantity ?? 0))
  }
  const usage: UsageSummary[] = [...usageMap.entries()].map(([meter, quantity]) => ({ meter, quantity }))

  return {
    organization: mapOrganization(membership.organizations as DbRow, String(membership.role) as OrganizationRole),
    stack,
    signals,
    skills,
    integrations,
    usage,
  }
}

export async function upsertStackComponent(input: {
  organizationId: string
  name: string
  technology: string
  kind: string
  version?: string
  environment?: string
  ownerTeam?: string
  criticality?: number
}) {
  const { supabase } = await requireUser()
  const name = input.name.trim()
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80)
  if (!slug || !input.technology.trim() || !input.kind.trim()) throw new Error('Name, technology, and kind are required')

  const { data, error } = await supabase
    .from('stack_components')
    .upsert({
      organization_id: input.organizationId,
      name,
      slug,
      technology: input.technology.trim(),
      kind: input.kind.trim(),
      version: input.version?.trim() || null,
      environment: input.environment?.trim() || 'production',
      owner_team: input.ownerTeam?.trim() || null,
      criticality: Math.max(1, Math.min(5, input.criticality ?? 2)),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'organization_id,slug,environment' })
    .select('*')
    .single()

  if (error) throw error
  revalidatePath('/stack')
  revalidatePath('/settings/platform')
  return data
}

export async function saveSkillScore(input: {
  organizationId?: string
  skillKey: string
  skillName: string
  domain: string
  score: number
  target?: number
  confidence?: number
  evidence?: Record<string, unknown>[]
}) {
  const { supabase, user } = await requireUser()
  const score = Math.max(0, Math.min(100, Math.round(input.score)))
  const target = Math.max(0, Math.min(100, Math.round(input.target ?? 80)))
  const confidence = Math.max(0, Math.min(1, input.confidence ?? 0.5))

  const { data, error } = await supabase
    .from('user_skill_scores')
    .upsert({
      user_id: user.id,
      organization_id: input.organizationId ?? null,
      skill_key: input.skillKey.trim().toLowerCase(),
      skill_name: input.skillName.trim(),
      domain: input.domain.trim(),
      score,
      target,
      confidence,
      evidence: input.evidence ?? [],
      assessed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,organization_id,skill_key' })
    .select('*')
    .single()

  if (error) throw error
  revalidatePath('/skills')
  return data
}

export async function saveIntegration(input: {
  organizationId: string
  provider: string
  displayName: string
  externalAccountId?: string
  config?: Record<string, unknown>
  credentialRef?: string
}) {
  const { supabase, user } = await requireUser()
  const provider = input.provider.trim().toLowerCase()
  const displayName = input.displayName.trim()
  if (!provider || !displayName) throw new Error('Provider and display name are required')

  const { data, error } = await supabase
    .from('integration_connections')
    .upsert({
      organization_id: input.organizationId,
      provider,
      display_name: displayName,
      external_account_id: input.externalAccountId?.trim() || null,
      credential_ref: input.credentialRef?.trim() || null,
      config: input.config ?? {},
      status: 'active',
      created_by: user.id,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'organization_id,provider,display_name' })
    .select('*')
    .single()

  if (error) throw error
  revalidatePath('/settings/platform')
  return data
}

export async function createMcpApiKey(input: { organizationId: string; name: string; scopes?: string[] }) {
  const { supabase, user } = await requireUser()
  const rawKey = `rr_live_${randomBytes(32).toString('base64url')}`
  const keyPrefix = rawKey.slice(0, 16)
  const keyHash = createHash('sha256').update(rawKey).digest('hex')
  const scopes = input.scopes?.length ? input.scopes : ['mcp:read', 'mcp:tools']

  const { data, error } = await supabase
    .from('api_keys')
    .insert({
      organization_id: input.organizationId,
      created_by: user.id,
      name: input.name.trim() || 'MCP key',
      key_prefix: keyPrefix,
      key_hash: keyHash,
      scopes,
    })
    .select('id, name, key_prefix, scopes, created_at')
    .single()

  if (error) throw error
  await writeAudit(input.organizationId, user.id, 'api_key.created', 'api_key', String(data.id), { name: data.name, scopes })
  revalidatePath('/settings/platform')
  return { ...data, key: rawKey }
}

export async function revokeMcpApiKey(input: { organizationId: string; keyId: string }) {
  const { supabase, user } = await requireUser()
  const { error } = await supabase
    .from('api_keys')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', input.keyId)
    .eq('organization_id', input.organizationId)
  if (error) throw error
  await writeAudit(input.organizationId, user.id, 'api_key.revoked', 'api_key', input.keyId)
  revalidatePath('/settings/platform')
}

export async function listMcpApiKeys(organizationId: string) {
  const { supabase } = await requireUser()
  const { data, error } = await supabase
    .from('api_keys')
    .select('id, name, key_prefix, scopes, last_used_at, expires_at, revoked_at, created_at')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function writeAudit(
  organizationId: string,
  actorUserId: string | null,
  action: string,
  resourceType: string,
  resourceId?: string,
  details: Record<string, unknown> = {},
) {
  const service = createServiceRoleClient()
  if (!service) return
  await service.from('organization_audit_log').insert({
    organization_id: organizationId,
    actor_user_id: actorUserId,
    actor_type: actorUserId ? 'user' : 'system',
    action,
    resource_type: resourceType,
    resource_id: resourceId ?? null,
    details,
  })
}
