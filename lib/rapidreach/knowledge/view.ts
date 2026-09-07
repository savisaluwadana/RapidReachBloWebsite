import { createCachedClient, createClient } from '@/lib/supabase/server'

export type KnowledgeGraphNode = {
  id: string
  title: string
  nodeType: string
  domain: string
  technology: string | null
  sourceType: string
  sourceUrl: string | null
  tags: string[]
}

export type KnowledgeGraphEdge = {
  id: string
  from: string
  to: string
  relationship: string
  weight: number
}

export async function getKnowledgeGraphView() {
  const authClient = await createClient()
  let organizationId: string | null = null
  if (authClient) {
    const { data: { user } } = await authClient.auth.getUser()
    if (user) {
      const { data: membership } = await authClient
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle()
      organizationId = membership?.organization_id ? String(membership.organization_id) : null
    }
  }

  const client = authClient ?? createCachedClient()
  if (!client) return { nodes: [] as KnowledgeGraphNode[], edges: [] as KnowledgeGraphEdge[], organizationId: null, live: false }

  try {
    let nodeQuery = client
      .from('engineering_knowledge_nodes')
      .select('id, title, node_type, domain, technology, source_type, source_url, tags')
      .order('updated_at', { ascending: false })
      .limit(80)
    nodeQuery = organizationId
      ? nodeQuery.or(`organization_id.eq.${organizationId},organization_id.is.null`)
      : nodeQuery.is('organization_id', null)
    const { data: rawNodes, error: nodeError } = await nodeQuery
    if (nodeError || !rawNodes?.length) return { nodes: [] as KnowledgeGraphNode[], edges: [] as KnowledgeGraphEdge[], organizationId, live: false }

    const nodes: KnowledgeGraphNode[] = rawNodes.map((row) => ({
      id: String(row.id),
      title: String(row.title),
      nodeType: String(row.node_type),
      domain: String(row.domain),
      technology: row.technology ? String(row.technology) : null,
      sourceType: String(row.source_type),
      sourceUrl: row.source_url ? String(row.source_url) : null,
      tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
    }))
    const nodeIds = nodes.map((node) => node.id)
    let edges: KnowledgeGraphEdge[] = []
    if (nodeIds.length) {
      const { data: rawEdges } = await client
        .from('engineering_knowledge_edges')
        .select('id, from_node_id, to_node_id, relationship, weight')
        .in('from_node_id', nodeIds)
        .in('to_node_id', nodeIds)
        .limit(160)
      edges = (rawEdges ?? []).map((row) => ({
        id: String(row.id),
        from: String(row.from_node_id),
        to: String(row.to_node_id),
        relationship: String(row.relationship),
        weight: Number(row.weight),
      }))
    }
    return { nodes, edges, organizationId, live: true }
  } catch {
    return { nodes: [] as KnowledgeGraphNode[], edges: [] as KnowledgeGraphEdge[], organizationId, live: false }
  }
}
