import { createCachedClient, createClient } from '@/lib/supabase/server'
import { intelligenceSignals as demoSignals, skills as demoSkills, stackTechnologies as demoStack } from '@/lib/rapidreach/product-data'

export type IntelligenceViewSignal = {
  id: string
  source: string
  title: string
  impact: 'critical' | 'high' | 'medium' | 'low'
  domain: string
  summary: string
  affected: string[]
  action: string
  live: boolean
  sourceUrl?: string
  publishedAt?: string
}

export type SkillView = {
  id: string
  name: string
  domain: string
  score: number
  target: number
  dependency?: string
  live: boolean
}

export type StackView = {
  id: string
  name: string
  layer: string
  exposure: 'low' | 'medium' | 'high'
  live: boolean
}

export type TeamDashboardData = {
  organizationId: string | null
  organizationName: string | null
  plan: string | null
  members: number
  stackComponents: number
  openHighSignals: number
  averageSkill: number | null
  live: boolean
}

type DbRow = Record<string, unknown>

const skillDependencies: Record<string, string | undefined> = {
  networking: 'linux',
  containers: 'linux',
  kubernetes: 'containers',
  gitops: 'kubernetes',
  observability: 'networking',
  sre: 'observability',
  security: 'kubernetes',
}

async function currentOrganization() {
  const supabase = await createClient()
  if (!supabase) return { supabase: null, organizationId: null, userId: null }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, organizationId: null, userId: null }
  const { data } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()
  return { supabase, organizationId: data?.organization_id ? String(data.organization_id) : null, userId: user.id }
}

export async function getIntelligenceView(): Promise<IntelligenceViewSignal[]> {
  try {
    const current = await currentOrganization()
    const supabase = current.supabase ?? createCachedClient()
    if (!supabase) return demoIntelligence()
    let query = supabase.from('intelligence_signals').select('*').order('created_at', { ascending: false }).limit(100)
    query = current.organizationId
      ? query.or(`organization_id.eq.${current.organizationId},organization_id.is.null`)
      : query.is('organization_id', null)
    const { data: rows, error } = await query
    if (error || !rows?.length) return demoIntelligence()

    const typedRows = rows as DbRow[]
    const componentIds = [...new Set(typedRows.flatMap((row: DbRow) =>
      Array.isArray(row.affected_component_ids) ? row.affected_component_ids.map(String) : []
    ))]
    const componentNames = new Map<string, string>()
    if (componentIds.length && current.organizationId && current.supabase) {
      const { data: components } = await current.supabase.from('stack_components').select('id, name').in('id', componentIds)
      for (const component of (components ?? []) as DbRow[]) componentNames.set(String(component.id), String(component.name))
    }

    return typedRows.map((row: DbRow) => {
      const affectedIds = Array.isArray(row.affected_component_ids) ? row.affected_component_ids.map(String) : []
      const affected = affectedIds.map((id: string) => componentNames.get(id)).filter((value: string | undefined): value is string => Boolean(value))
      if (!affected.length && row.technology) affected.push(String(row.technology))
      return {
        id: String(row.id),
        source: String(row.source_provider),
        title: String(row.title),
        impact: normalizeSeverity(String(row.severity)),
        domain: String(row.domain),
        summary: String(row.summary),
        affected,
        action: row.recommended_action ? String(row.recommended_action) : 'Review the source evidence and validate the change against your environment.',
        live: true,
        sourceUrl: row.source_url ? String(row.source_url) : undefined,
        publishedAt: row.published_at ? String(row.published_at) : undefined,
      }
    })
  } catch {
    return demoIntelligence()
  }
}

export async function getSkillView(): Promise<SkillView[]> {
  try {
    const current = await currentOrganization()
    if (!current.supabase || !current.userId) return demoSkills.map((skill) => ({ ...skill, live: false }))
    let query = current.supabase.from('user_skill_scores').select('*').eq('user_id', current.userId).order('score', { ascending: true })
    if (current.organizationId) query = query.or(`organization_id.eq.${current.organizationId},organization_id.is.null`)
    else query = query.is('organization_id', null)
    const { data, error } = await query
    if (error || !data?.length) return demoSkills.map((skill) => ({ ...skill, live: false }))
    return (data as DbRow[]).map((row: DbRow) => ({
      id: String(row.skill_key),
      name: String(row.skill_name),
      domain: String(row.domain),
      score: Number(row.score),
      target: Number(row.target),
      dependency: skillDependencies[String(row.skill_key)],
      live: true,
    }))
  } catch {
    return demoSkills.map((skill) => ({ ...skill, live: false }))
  }
}

export async function getStackView(): Promise<StackView[]> {
  try {
    const current = await currentOrganization()
    if (!current.supabase || !current.organizationId) return demoStack.map((item) => ({ ...item, live: false }))
    const { data, error } = await current.supabase
      .from('stack_components')
      .select('id, name, kind, technology, criticality')
      .eq('organization_id', current.organizationId)
      .order('criticality', { ascending: false })
    if (error || !data?.length) return demoStack.map((item) => ({ ...item, live: false }))
    return (data as DbRow[]).map((row: DbRow) => ({
      id: String(row.id),
      name: String(row.name || row.technology),
      layer: String(row.kind),
      exposure: Number(row.criticality) >= 4 ? 'high' : Number(row.criticality) >= 3 ? 'medium' : 'low',
      live: true,
    }))
  } catch {
    return demoStack.map((item) => ({ ...item, live: false }))
  }
}

export async function getTeamDashboard(): Promise<TeamDashboardData> {
  try {
    const current = await currentOrganization()
    if (!current.supabase || !current.organizationId) return emptyTeamDashboard()
    const [{ data: org }, { count: members }, { count: stackComponents }, { count: highSignals }, { data: skillRows }] = await Promise.all([
      current.supabase.from('organizations').select('id, name, plan').eq('id', current.organizationId).single(),
      current.supabase.from('organization_members').select('id', { count: 'exact', head: true }).eq('organization_id', current.organizationId).eq('status', 'active'),
      current.supabase.from('stack_components').select('id', { count: 'exact', head: true }).eq('organization_id', current.organizationId),
      current.supabase.from('intelligence_signals').select('id', { count: 'exact', head: true }).eq('organization_id', current.organizationId).in('severity', ['high', 'critical']).neq('status', 'resolved'),
      current.supabase.from('user_skill_scores').select('score').eq('organization_id', current.organizationId),
    ])
    if (!org) return emptyTeamDashboard()
    const scores = ((skillRows ?? []) as DbRow[]).map((row: DbRow) => Number(row.score)).filter(Number.isFinite)
    return {
      organizationId: String(org.id),
      organizationName: String(org.name),
      plan: String(org.plan),
      members: members ?? 0,
      stackComponents: stackComponents ?? 0,
      openHighSignals: highSignals ?? 0,
      averageSkill: scores.length ? Math.round(scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length) : null,
      live: true,
    }
  } catch {
    return emptyTeamDashboard()
  }
}

function demoIntelligence(): IntelligenceViewSignal[] {
  return demoSignals.map((signal) => ({
    id: signal.id,
    source: signal.source,
    title: signal.title,
    impact: signal.impact,
    domain: signal.domain,
    summary: signal.summary,
    affected: signal.affected,
    action: signal.action,
    live: false,
  }))
}

function normalizeSeverity(value: string): IntelligenceViewSignal['impact'] {
  if (value === 'critical' || value === 'high' || value === 'medium') return value
  return 'low'
}

function emptyTeamDashboard(): TeamDashboardData {
  return { organizationId: null, organizationName: null, plan: null, members: 0, stackComponents: 0, openHighSignals: 0, averageSkill: null, live: false }
}
