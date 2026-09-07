import { createServiceRoleClient } from '@/lib/supabase/server'

type KnowledgeNodeInput = {
  organizationId: string | null
  externalKey: string
  nodeType: string
  title: string
  summary: string
  content?: string
  domain?: string
  technology?: string | null
  sourceUrl?: string | null
  sourceType: string
  tags?: string[]
  metadata?: Record<string, unknown>
}

type KnowledgeNodeRow = { id: string; organization_id: string | null; external_key: string }

type EmbeddingResponse = { data?: Array<{ embedding?: number[] }> }

export async function rebuildKnowledgeIndex() {
  const service = createServiceRoleClient()
  if (!service) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for knowledge indexing')

  const [{ data: posts, error: postsError }, { data: signals, error: signalsError }, { data: components, error: componentsError }] = await Promise.all([
    service.from('posts').select('id, slug, title, excerpt, content, category, categories, tags, published_at, updated_at, related_posts').eq('status', 'published'),
    service.from('intelligence_signals').select('id, organization_id, title, summary, domain, technology, source_url, source_provider, severity, status, affected_component_ids, evidence, updated_at'),
    service.from('stack_components').select('id, organization_id, name, kind, technology, version, environment, owner_team, criticality, metadata, updated_at'),
  ])
  if (postsError) throw postsError
  if (signalsError) throw signalsError
  if (componentsError) throw componentsError

  const idMap = new Map<string, string>()
  let indexed = 0

  for (const post of posts ?? []) {
    const node = await upsertNode({
      organizationId: null,
      externalKey: `post:${post.id}`,
      nodeType: 'article',
      title: String(post.title),
      summary: String(post.excerpt ?? ''),
      content: String(post.content ?? ''),
      domain: String(post.category ?? 'Engineering'),
      sourceUrl: `/blog/${post.slug}`,
      sourceType: 'rapidreach-article',
      tags: [...new Set([...(Array.isArray(post.tags) ? post.tags.map(String) : []), ...(Array.isArray(post.categories) ? post.categories.map(String) : [])])],
      metadata: { postId: post.id, publishedAt: post.published_at, updatedAt: post.updated_at, relatedPosts: post.related_posts ?? [] },
    })
    idMap.set(`post:${post.id}`, node.id)
    indexed++
  }

  for (const signal of signals ?? []) {
    const node = await upsertNode({
      organizationId: signal.organization_id ? String(signal.organization_id) : null,
      externalKey: `signal:${signal.id}`,
      nodeType: 'intelligence-signal',
      title: String(signal.title),
      summary: String(signal.summary ?? ''),
      domain: String(signal.domain ?? 'Engineering'),
      technology: signal.technology ? String(signal.technology) : null,
      sourceUrl: signal.source_url ? String(signal.source_url) : null,
      sourceType: String(signal.source_provider ?? 'intelligence'),
      tags: [String(signal.technology ?? ''), String(signal.severity ?? ''), String(signal.status ?? '')].filter(Boolean),
      metadata: { signalId: signal.id, severity: signal.severity, status: signal.status, affectedComponentIds: signal.affected_component_ids ?? [], evidence: signal.evidence ?? {}, updatedAt: signal.updated_at },
    })
    idMap.set(`signal:${signal.id}`, node.id)
    indexed++
  }

  for (const component of components ?? []) {
    const node = await upsertNode({
      organizationId: String(component.organization_id),
      externalKey: `stack:${component.id}`,
      nodeType: 'stack-component',
      title: String(component.name),
      summary: `${String(component.kind)} running ${String(component.technology)}${component.version ? ` ${String(component.version)}` : ''} in ${String(component.environment)}.`,
      domain: String(component.kind),
      technology: String(component.technology),
      sourceType: 'organization-stack',
      tags: [String(component.technology), String(component.kind), String(component.environment), component.owner_team ? String(component.owner_team) : ''].filter(Boolean),
      metadata: { componentId: component.id, version: component.version, environment: component.environment, ownerTeam: component.owner_team, criticality: component.criticality, ...((component.metadata ?? {}) as Record<string, unknown>), updatedAt: component.updated_at },
    })
    idMap.set(`stack:${component.id}`, node.id)
    indexed++
  }

  let edges = 0
  for (const post of posts ?? []) {
    const from = idMap.get(`post:${post.id}`)
    if (!from || !Array.isArray(post.related_posts)) continue
    for (const related of post.related_posts) {
      const to = idMap.get(`post:${String(related)}`)
      if (!to) continue
      await upsertEdge(null, from, to, 'related-to', { source: 'post.related_posts' })
      edges++
    }
  }

  for (const signal of signals ?? []) {
    const signalNode = idMap.get(`signal:${signal.id}`)
    if (!signalNode || !Array.isArray(signal.affected_component_ids)) continue
    for (const componentId of signal.affected_component_ids) {
      const componentNode = idMap.get(`stack:${String(componentId)}`)
      if (!componentNode) continue
      await upsertEdge(signal.organization_id ? String(signal.organization_id) : null, signalNode, componentNode, 'affects', { source: 'impact-matcher' })
      edges++
    }
  }

  return { indexed, edges }
}

export async function searchKnowledge(input: { query: string; organizationId?: string | null; limit?: number; semantic?: boolean }) {
  const service = createServiceRoleClient()
  if (!service) throw new Error('Knowledge search is unavailable')
  const query = input.query.trim()
  if (!query) return []
  const limit = Math.max(1, Math.min(50, input.limit ?? 20))

  if (input.semantic) {
    const embedding = await embedText(query)
    if (embedding) {
      const { data, error } = await service.rpc('match_engineering_knowledge', {
        query_embedding: vectorLiteral(embedding),
        target_org: input.organizationId ?? null,
        match_threshold: 0.5,
        match_count: limit,
      })
      if (!error && data?.length) return data
    }
  }

  const { data, error } = await service.rpc('search_engineering_knowledge', {
    query_text: query,
    target_org: input.organizationId ?? null,
    result_limit: limit,
  })
  if (error) throw error
  return data ?? []
}

async function upsertNode(input: KnowledgeNodeInput): Promise<KnowledgeNodeRow> {
  const service = createServiceRoleClient()
  if (!service) throw new Error('Service role unavailable')
  let existingQuery = service.from('engineering_knowledge_nodes').select('id, organization_id, external_key').eq('external_key', input.externalKey)
  existingQuery = input.organizationId ? existingQuery.eq('organization_id', input.organizationId) : existingQuery.is('organization_id', null)
  const { data: existing } = await existingQuery.maybeSingle()

  const searchableText = `${input.title}\n${input.summary}\n${input.content ?? ''}`.slice(0, 12_000)
  const embedding = await embedText(searchableText)
  const payload = {
    organization_id: input.organizationId,
    external_key: input.externalKey,
    node_type: input.nodeType,
    title: input.title,
    summary: input.summary,
    content: input.content ?? '',
    domain: input.domain ?? 'Engineering',
    technology: input.technology ?? null,
    source_url: input.sourceUrl ?? null,
    source_type: input.sourceType,
    tags: input.tags ?? [],
    metadata: input.metadata ?? {},
    ...(embedding ? { embedding: vectorLiteral(embedding) } : {}),
    updated_at: new Date().toISOString(),
  }

  if (existing) {
    const { data, error } = await service.from('engineering_knowledge_nodes').update(payload).eq('id', existing.id).select('id, organization_id, external_key').single()
    if (error) throw error
    return data as KnowledgeNodeRow
  }
  const { data, error } = await service.from('engineering_knowledge_nodes').insert(payload).select('id, organization_id, external_key').single()
  if (error) throw error
  return data as KnowledgeNodeRow
}

async function upsertEdge(organizationId: string | null, fromNodeId: string, toNodeId: string, relationship: string, evidence: Record<string, unknown>) {
  const service = createServiceRoleClient()
  if (!service) throw new Error('Service role unavailable')
  let query = service.from('engineering_knowledge_edges').select('id').eq('from_node_id', fromNodeId).eq('to_node_id', toNodeId).eq('relationship', relationship)
  query = organizationId ? query.eq('organization_id', organizationId) : query.is('organization_id', null)
  const { data: existing } = await query.maybeSingle()
  const payload = { organization_id: organizationId, from_node_id: fromNodeId, to_node_id: toNodeId, relationship, evidence }
  if (existing) {
    const { error } = await service.from('engineering_knowledge_edges').update(payload).eq('id', existing.id)
    if (error) throw error
  } else {
    const { error } = await service.from('engineering_knowledge_edges').insert(payload)
    if (error) throw error
  }
}

async function embedText(text: string) {
  const url = process.env.RAPIDREACH_EMBEDDING_URL
  if (!url) return null
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.RAPIDREACH_EMBEDDING_API_KEY ? { Authorization: `Bearer ${process.env.RAPIDREACH_EMBEDDING_API_KEY}` } : {}),
    },
    body: JSON.stringify({ model: process.env.RAPIDREACH_EMBEDDING_MODEL ?? 'text-embedding-3-small', input: text }),
    cache: 'no-store',
  })
  if (!response.ok) return null
  const payload = await response.json() as EmbeddingResponse
  const embedding = payload.data?.[0]?.embedding
  return Array.isArray(embedding) && embedding.length === 1536 && embedding.every(Number.isFinite) ? embedding : null
}

function vectorLiteral(values: number[]) {
  return `[${values.join(',')}]`
}
