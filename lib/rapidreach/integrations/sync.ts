import { createServiceRoleClient } from '@/lib/supabase/server'

type IntegrationRow = {
  id: string
  organization_id: string
  provider: string
  credential_ref: string | null
  config: Record<string, unknown> | null
}

type DiscoveredComponent = {
  externalId: string
  name: string
  kind: string
  technology: string
  version?: string
  environment?: string
  ownerTeam?: string
  criticality?: number
  metadata?: Record<string, unknown>
}

type JsonObject = Record<string, unknown>

export async function syncIntegration(integrationId: string) {
  const service = createServiceRoleClient()
  if (!service) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for integration sync')
  const { data, error } = await service.from('integration_connections').select('*').eq('id', integrationId).single()
  if (error) throw error
  const integration = data as IntegrationRow
  const startedAt = Date.now()
  try {
    const components = await discover(integration)
    for (const component of components) {
      await upsertDiscoveredComponent(integration, component)
    }
    await service.from('integration_connections').update({
      status: 'active',
      last_synced_at: new Date().toISOString(),
      last_error: null,
      updated_at: new Date().toISOString(),
    }).eq('id', integration.id)
    return { integrationId, provider: integration.provider, components: components.length, durationMs: Date.now() - startedAt }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    await service.from('integration_connections').update({ status: 'error', last_error: message, updated_at: new Date().toISOString() }).eq('id', integration.id)
    throw error
  }
}

export async function syncAllIntegrations() {
  const service = createServiceRoleClient()
  if (!service) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for integration sync')
  const { data, error } = await service.from('integration_connections').select('id').eq('status', 'active')
  if (error) throw error
  const results: Array<{ id: string; ok: boolean; components?: number; error?: string }> = []
  for (const row of data ?? []) {
    const id = String(row.id)
    try {
      const result = await syncIntegration(id)
      results.push({ id, ok: true, components: result.components })
    } catch (syncError) {
      results.push({ id, ok: false, error: syncError instanceof Error ? syncError.message : String(syncError) })
    }
  }
  return results
}

async function discover(integration: IntegrationRow): Promise<DiscoveredComponent[]> {
  switch (integration.provider.toLowerCase()) {
    case 'github': return discoverGitHub(integration)
    case 'kubernetes': return discoverKubernetes(integration)
    case 'argocd':
    case 'argo-cd': return discoverArgoCD(integration)
    case 'backstage': return discoverBackstage(integration)
    case 'pagerduty': return discoverPagerDuty(integration)
    case 'terraform-cloud':
    case 'terraform': return discoverTerraformCloud(integration)
    case 'grafana': return discoverGrafana(integration)
    default: throw new Error(`No synchronizer is registered for provider ${integration.provider}`)
  }
}

async function discoverGitHub(integration: IntegrationRow) {
  const config = integration.config ?? {}
  const configured = Array.isArray(config.repositories)
    ? config.repositories.map(String)
    : typeof config.repository === 'string' && config.repository ? [config.repository] : []
  if (!configured.length) throw new Error('GitHub integration requires config.repository or config.repositories')
  const token = credential(integration.credential_ref, false)
  const components: DiscoveredComponent[] = []
  for (const repo of configured) {
    const payload = await jsonFetch(`https://api.github.com/repos/${repo}`, token ? { Authorization: `Bearer ${token}` } : {}, 'GitHub')
    const topics = Array.isArray(payload.topics) ? payload.topics.map(String) : []
    components.push({
      externalId: `github:${repo}`,
      name: String(payload.full_name ?? repo),
      kind: 'Repository',
      technology: 'GitHub',
      criticality: 2,
      metadata: { url: payload.html_url, defaultBranch: payload.default_branch, topics, language: payload.language },
    })
    for (const topic of topics) {
      const technology = knownTechnology(topic)
      if (!technology) continue
      components.push({
        externalId: `github:${repo}:tech:${technology.toLowerCase().replace(/\s+/g, '-')}`,
        name: `${repo} · ${technology}`,
        kind: 'Repository dependency',
        technology,
        criticality: 3,
        metadata: { repository: repo, discoveredFrom: 'github-topic' },
      })
    }
  }
  return components
}

async function discoverKubernetes(integration: IntegrationRow) {
  const config = integration.config ?? {}
  const apiUrl = requireString(config.apiUrl, 'Kubernetes config.apiUrl').replace(/\/$/, '')
  const token = credential(integration.credential_ref, true)
  const payload = await jsonFetch(`${apiUrl}/apis/apps/v1/deployments?limit=500`, { Authorization: `Bearer ${token}` }, 'Kubernetes')
  const items = Array.isArray(payload.items) ? payload.items as JsonObject[] : []
  return items.map((item) => {
    const metadata = (item.metadata ?? {}) as JsonObject
    const spec = (item.spec ?? {}) as JsonObject
    const template = (spec.template ?? {}) as JsonObject
    const podSpec = (template.spec ?? {}) as JsonObject
    const containers = Array.isArray(podSpec.containers) ? podSpec.containers as JsonObject[] : []
    const images = containers.map((container) => String(container.image ?? '')).filter(Boolean)
    const namespace = String(metadata.namespace ?? 'default')
    const name = String(metadata.name ?? 'deployment')
    return {
      externalId: `kubernetes:${namespace}:deployment:${name}`,
      name: `${namespace}/${name}`,
      kind: 'Kubernetes Deployment',
      technology: 'Kubernetes',
      version: imageVersion(images[0]),
      environment: String(config.environment ?? 'production'),
      criticality: Number(config.defaultCriticality ?? 3),
      metadata: { namespace, images, replicas: spec.replicas },
    }
  })
}

async function discoverArgoCD(integration: IntegrationRow) {
  const config = integration.config ?? {}
  const apiUrl = requireString(config.apiUrl, 'Argo CD config.apiUrl').replace(/\/$/, '')
  const token = credential(integration.credential_ref, true)
  const payload = await jsonFetch(`${apiUrl}/api/v1/applications`, { Authorization: `Bearer ${token}` }, 'Argo CD')
  const items = Array.isArray(payload.items) ? payload.items as JsonObject[] : []
  return items.map((item) => {
    const metadata = (item.metadata ?? {}) as JsonObject
    const spec = (item.spec ?? {}) as JsonObject
    const destination = (spec.destination ?? {}) as JsonObject
    const source = (spec.source ?? {}) as JsonObject
    const name = String(metadata.name ?? 'application')
    return {
      externalId: `argocd:${name}`,
      name,
      kind: 'GitOps Application',
      technology: 'Argo CD',
      environment: String(destination.namespace ?? config.environment ?? 'production'),
      criticality: Number(config.defaultCriticality ?? 3),
      metadata: { repoURL: source.repoURL, path: source.path, destinationServer: destination.server },
    }
  })
}

async function discoverBackstage(integration: IntegrationRow) {
  const config = integration.config ?? {}
  const apiUrl = requireString(config.apiUrl, 'Backstage config.apiUrl').replace(/\/$/, '')
  const token = credential(integration.credential_ref, false)
  const payload = await jsonFetch(`${apiUrl}/api/catalog/entities`, token ? { Authorization: `Bearer ${token}` } : {}, 'Backstage')
  const items = Array.isArray(payload) ? payload as JsonObject[] : []
  return items.filter((item) => ['component', 'system', 'resource'].includes(String(item.kind ?? '').toLowerCase())).map((item) => {
    const metadata = (item.metadata ?? {}) as JsonObject
    const spec = (item.spec ?? {}) as JsonObject
    const name = String(metadata.name ?? 'entity')
    return {
      externalId: `backstage:${String(item.kind ?? 'entity').toLowerCase()}:${name}`,
      name,
      kind: `Backstage ${String(item.kind ?? 'Entity')}`,
      technology: knownTechnology(String(spec.type ?? '')) ?? 'Backstage',
      ownerTeam: spec.owner ? String(spec.owner) : undefined,
      criticality: Number(config.defaultCriticality ?? 2),
      metadata: { lifecycle: spec.lifecycle, system: spec.system, annotations: metadata.annotations },
    }
  })
}

async function discoverPagerDuty(integration: IntegrationRow) {
  const token = credential(integration.credential_ref, true)
  const payload = await jsonFetch('https://api.pagerduty.com/services?limit=100', { Authorization: `Token token=${token}`, Accept: 'application/vnd.pagerduty+json;version=2' }, 'PagerDuty')
  const services = Array.isArray(payload.services) ? payload.services as JsonObject[] : []
  return services.map((service) => ({
    externalId: `pagerduty:${String(service.id)}`,
    name: String(service.name ?? service.id),
    kind: 'Incident Service',
    technology: 'PagerDuty',
    criticality: 4,
    metadata: { id: service.id, status: service.status, escalationPolicy: service.escalation_policy },
  }))
}

async function discoverTerraformCloud(integration: IntegrationRow) {
  const config = integration.config ?? {}
  const organization = requireString(config.organization, 'Terraform Cloud config.organization')
  const token = credential(integration.credential_ref, true)
  const payload = await jsonFetch(`https://app.terraform.io/api/v2/organizations/${encodeURIComponent(organization)}/workspaces?page[size]=100`, { Authorization: `Bearer ${token}`, 'Content-Type': 'application/vnd.api+json' }, 'Terraform Cloud')
  const workspaces = Array.isArray(payload.data) ? payload.data as JsonObject[] : []
  return workspaces.map((workspace) => {
    const attributes = (workspace.attributes ?? {}) as JsonObject
    return {
      externalId: `terraform:${String(workspace.id)}`,
      name: String(attributes.name ?? workspace.id),
      kind: 'Terraform Workspace',
      technology: 'Terraform',
      environment: String(attributes['environment'] ?? config.environment ?? 'production'),
      criticality: Number(config.defaultCriticality ?? 3),
      metadata: { terraformVersion: attributes['terraform-version'], autoApply: attributes['auto-apply'], resourceCount: attributes['resource-count'] },
    }
  })
}

async function discoverGrafana(integration: IntegrationRow) {
  const config = integration.config ?? {}
  const apiUrl = requireString(config.apiUrl, 'Grafana config.apiUrl').replace(/\/$/, '')
  const token = credential(integration.credential_ref, true)
  const payload = await jsonFetch(`${apiUrl}/api/datasources`, { Authorization: `Bearer ${token}` }, 'Grafana')
  const datasources = Array.isArray(payload) ? payload as JsonObject[] : []
  return datasources.map((datasource) => ({
    externalId: `grafana:datasource:${String(datasource.uid ?? datasource.id)}`,
    name: String(datasource.name ?? 'Grafana datasource'),
    kind: 'Observability Data Source',
    technology: knownTechnology(String(datasource.type ?? '')) ?? 'Grafana',
    criticality: 2,
    metadata: { type: datasource.type, url: datasource.url, access: datasource.access },
  }))
}

async function upsertDiscoveredComponent(integration: IntegrationRow, component: DiscoveredComponent) {
  const service = createServiceRoleClient()
  if (!service) throw new Error('Service role unavailable')
  const slug = slugify(`${integration.provider}-${component.externalId}`)
  const { error } = await service.from('stack_components').upsert({
    organization_id: integration.organization_id,
    integration_id: integration.id,
    external_id: component.externalId,
    name: component.name,
    slug,
    kind: component.kind,
    technology: component.technology,
    version: component.version ?? null,
    environment: component.environment ?? 'production',
    owner_team: component.ownerTeam ?? null,
    criticality: Math.max(1, Math.min(5, component.criticality ?? 2)),
    metadata: component.metadata ?? {},
    updated_at: new Date().toISOString(),
  }, { onConflict: 'organization_id,slug,environment' })
  if (error) throw error
}

async function jsonFetch(url: string, headers: Record<string, string>, provider: string) {
  const response = await fetch(url, { headers: { 'User-Agent': 'RapidReach-Integration-Sync/1.0', Accept: 'application/json', ...headers }, cache: 'no-store' })
  if (!response.ok) throw new Error(`${provider} API ${response.status}: ${(await response.text()).slice(0, 300)}`)
  return response.json() as Promise<JsonObject>
}

function credential(reference: string | null, required: boolean) {
  if (!reference) {
    if (required) throw new Error('This integration requires a credential_ref')
    return null
  }
  if (!/^[A-Z][A-Z0-9_]{2,99}$/.test(reference)) throw new Error('credential_ref must be the name of a server environment variable')
  const value = process.env[reference]
  if (!value && required) throw new Error(`Credential environment variable ${reference} is not configured`)
  return value ?? null
}

function requireString(value: unknown, label: string) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} is required`)
  return value.trim()
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 100) || 'component'
}

function imageVersion(image?: string) {
  if (!image) return undefined
  const withoutDigest = image.split('@')[0]
  const lastSlash = withoutDigest.lastIndexOf('/')
  const colon = withoutDigest.indexOf(':', lastSlash + 1)
  return colon >= 0 ? withoutDigest.slice(colon + 1) : undefined
}

function knownTechnology(value: string) {
  const normalized = value.toLowerCase()
  const mappings: Array<[RegExp, string]> = [
    [/kubernetes|k8s/, 'Kubernetes'],
    [/cilium/, 'Cilium'],
    [/argo.?cd|argocd/, 'Argo CD'],
    [/prometheus/, 'Prometheus'],
    [/grafana/, 'Grafana'],
    [/terraform/, 'Terraform'],
    [/backstage/, 'Backstage'],
    [/pagerduty/, 'PagerDuty'],
    [/datadog/, 'Datadog'],
  ]
  return mappings.find(([pattern]) => pattern.test(normalized))?.[1]
}
