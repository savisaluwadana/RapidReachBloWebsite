import { createServiceRoleClient } from '@/lib/supabase/server'
import type { SignalSeverity } from '@/lib/rapidreach/platform-types'
import { CloudRssAdapter } from './cloud-rss'
import { GitHubReleaseAdapter } from './github-releases'
import { NvdSecurityAdapter } from './nvd'
import type { IngestedSignal, IngestionResult, IntelligenceAdapter } from './types'

const severityRank: Record<SignalSeverity, number> = { low: 1, medium: 2, high: 3, critical: 4 }
const severityFromRank: Record<number, SignalSeverity> = { 1: 'low', 2: 'medium', 3: 'high', 4: 'critical' }

type StackRow = {
  id: string
  organization_id: string
  name: string
  technology: string
  version: string | null
  criticality: number
}

type OrganizationRow = { id: string }

type RuleRow = {
  id: string
  organization_id: string
  minimum_severity: SignalSeverity
  domains: string[] | null
  technologies: string[] | null
  channels: Record<string, unknown> | null
  enabled: boolean
}

export async function runIntelligenceIngestion(adapters: IntelligenceAdapter[] = defaultAdapters()) {
  const service = createServiceRoleClient()
  if (!service) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for intelligence ingestion')

  const { data: run, error: runError } = await service
    .from('worker_runs')
    .insert({ job_name: 'intelligence-ingestion', status: 'running' })
    .select('id')
    .single()
  if (runError) throw runError

  const results: IngestionResult[] = []
  let failed = false
  try {
    const { data: organizations, error: orgError } = await service.from('organizations').select('id')
    if (orgError) throw orgError

    const { data: components, error: componentError } = await service
      .from('stack_components')
      .select('id, organization_id, name, technology, version, criticality')
    if (componentError) throw componentError

    const orgRows = (organizations ?? []) as OrganizationRow[]
    const stackRows = (components ?? []) as StackRow[]

    for (const adapter of adapters) {
      const result: IngestionResult = { adapter: adapter.name, fetched: 0, stored: 0, matched: 0, errors: [] }
      try {
        const signals = await adapter.fetchSignals()
        result.fetched = signals.length
        for (const signal of signals) {
          const globalSignalId = await persistGlobalSignal(signal)
          if (globalSignalId) result.stored += 1

          for (const organization of orgRows) {
            const orgComponents = stackRows.filter((component) => component.organization_id === organization.id)
            const affected = matchComponents(signal, orgComponents)
            if (!affected.length) continue
            const tenantSignalId = await persistTenantSignal(organization.id, signal, affected)
            if (tenantSignalId) {
              result.matched += 1
              await dispatchNotifications(organization.id, tenantSignalId, signal, affected)
            }
          }
        }
      } catch (error) {
        failed = true
        result.errors.push(error instanceof Error ? error.message : String(error))
      }
      results.push(result)
    }

    await service.from('worker_runs').update({
      status: failed ? 'partial' : 'success',
      completed_at: new Date().toISOString(),
      stats: { results },
    }).eq('id', run.id)

    return { status: failed ? 'partial' as const : 'success' as const, results }
  } catch (error) {
    await service.from('worker_runs').update({
      status: 'error',
      completed_at: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
    }).eq('id', run.id)
    throw error
  }
}

function defaultAdapters(): IntelligenceAdapter[] {
  const adapters: IntelligenceAdapter[] = [new GitHubReleaseAdapter(), new CloudRssAdapter()]
  if (process.env.RAPIDREACH_ENABLE_NVD !== 'false') adapters.push(new NvdSecurityAdapter())
  return adapters
}

function matchComponents(signal: IngestedSignal, components: StackRow[]) {
  const technology = signal.technology?.toLowerCase().trim()
  const title = signal.title.toLowerCase()
  if (!technology) return []
  return components.filter((component) => {
    const haystack = `${component.technology} ${component.name}`.toLowerCase()
    return haystack.includes(technology) || technology.includes(component.technology.toLowerCase()) || title.includes(component.technology.toLowerCase())
  })
}

function tenantSeverity(base: SignalSeverity, affected: StackRow[]) {
  const maxCriticality = Math.max(...affected.map((component) => component.criticality || 1))
  const bump = maxCriticality >= 5 ? 2 : maxCriticality >= 4 ? 1 : 0
  return severityFromRank[Math.min(4, severityRank[base] + bump)]
}

async function persistGlobalSignal(signal: IngestedSignal) {
  const service = createServiceRoleClient()
  if (!service) return null
  const { data: existing } = await service
    .from('intelligence_signals')
    .select('id')
    .is('organization_id', null)
    .eq('source_provider', signal.sourceProvider)
    .eq('external_id', signal.externalId)
    .maybeSingle()

  const payload = signalPayload(null, signal, [], signal.severity)
  if (existing) {
    const { data, error } = await service.from('intelligence_signals').update(payload).eq('id', existing.id).select('id').single()
    if (error) throw error
    return String(data.id)
  }
  const { data, error } = await service.from('intelligence_signals').insert(payload).select('id').single()
  if (error) throw error
  return String(data.id)
}

async function persistTenantSignal(organizationId: string, signal: IngestedSignal, affected: StackRow[]) {
  const service = createServiceRoleClient()
  if (!service) return null
  const severity = tenantSeverity(signal.severity, affected)
  const { data: existing } = await service
    .from('intelligence_signals')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('source_provider', signal.sourceProvider)
    .eq('external_id', signal.externalId)
    .maybeSingle()
  const payload = signalPayload(organizationId, signal, affected.map((item) => item.id), severity)
  if (existing) {
    const { data, error } = await service.from('intelligence_signals').update(payload).eq('id', existing.id).select('id').single()
    if (error) throw error
    return String(data.id)
  }
  const { data, error } = await service.from('intelligence_signals').insert(payload).select('id').single()
  if (error) throw error
  return String(data.id)
}

function signalPayload(organizationId: string | null, signal: IngestedSignal, affectedComponentIds: string[], severity: SignalSeverity) {
  return {
    organization_id: organizationId,
    source_provider: signal.sourceProvider,
    external_id: signal.externalId,
    source_url: signal.sourceUrl ?? null,
    signal_type: signal.signalType,
    title: signal.title,
    summary: signal.summary,
    severity,
    domain: signal.domain,
    technology: signal.technology ?? null,
    version: signal.version ?? null,
    recommended_action: signal.recommendedAction ?? null,
    published_at: signal.publishedAt ?? null,
    affected_component_ids: affectedComponentIds,
    evidence: signal.evidence ?? {},
    raw_payload: signal.rawPayload ?? {},
    updated_at: new Date().toISOString(),
  }
}

async function dispatchNotifications(organizationId: string, signalId: string, signal: IngestedSignal, affected: StackRow[]) {
  const service = createServiceRoleClient()
  if (!service) return
  const severity = tenantSeverity(signal.severity, affected)
  const [{ data: rules }, { data: members }] = await Promise.all([
    service.from('intelligence_notification_rules').select('*').eq('organization_id', organizationId).eq('enabled', true),
    service.from('organization_members').select('user_id').eq('organization_id', organizationId).eq('status', 'active'),
  ])

  const matchingRules = ((rules ?? []) as RuleRow[]).filter((rule) => {
    if (severityRank[severity] < severityRank[rule.minimum_severity]) return false
    const domains = rule.domains ?? []
    const technologies = rule.technologies ?? []
    if (domains.length && !domains.some((domain) => domain.toLowerCase() === signal.domain.toLowerCase())) return false
    if (technologies.length && signal.technology && !technologies.some((tech) => tech.toLowerCase() === signal.technology?.toLowerCase())) return false
    return rule.channels?.in_app !== false
  })

  if (!matchingRules.length && severityRank[severity] < severityRank.high) return
  const link = `/intelligence?signal=${signalId}`
  for (const member of members ?? []) {
    const userId = String(member.user_id)
    const { data: existing } = await service
      .from('notifications')
      .select('id')
      .eq('user_id', userId)
      .eq('link', link)
      .maybeSingle()
    if (existing) continue
    await service.from('notifications').insert({
      user_id: userId,
      type: 'intelligence_alert',
      title: `${severity.toUpperCase()} · ${signal.title}`,
      message: signal.recommendedAction ?? signal.summary.slice(0, 280),
      link,
    })
  }
}
