CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS engineering_knowledge_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  external_key TEXT NOT NULL,
  node_type TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  domain TEXT NOT NULL DEFAULT 'Engineering',
  technology TEXT,
  source_url TEXT,
  source_type TEXT NOT NULL DEFAULT 'internal',
  tags TEXT[] NOT NULL DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}',
  embedding vector(1536),
  search_vector TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(summary, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(content, '')), 'C') ||
    setweight(to_tsvector('english', array_to_string(tags, ' ')), 'B')
  ) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, external_key)
);

CREATE TABLE IF NOT EXISTS engineering_knowledge_edges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  from_node_id UUID NOT NULL REFERENCES engineering_knowledge_nodes(id) ON DELETE CASCADE,
  to_node_id UUID NOT NULL REFERENCES engineering_knowledge_nodes(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL,
  weight NUMERIC(6,4) NOT NULL DEFAULT 1.0,
  evidence JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, from_node_id, to_node_id, relationship)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_global_knowledge_external_key
ON engineering_knowledge_nodes(external_key)
WHERE organization_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_knowledge_search ON engineering_knowledge_nodes USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_knowledge_tags ON engineering_knowledge_nodes USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_knowledge_org_domain ON engineering_knowledge_nodes(organization_id, domain, technology);
CREATE INDEX IF NOT EXISTS idx_knowledge_edges_from ON engineering_knowledge_edges(organization_id, from_node_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_edges_to ON engineering_knowledge_edges(organization_id, to_node_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_embedding_hnsw ON engineering_knowledge_nodes USING hnsw (embedding vector_cosine_ops) WHERE embedding IS NOT NULL;

ALTER TABLE engineering_knowledge_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_knowledge_edges ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "global or tenant knowledge is readable" ON engineering_knowledge_nodes FOR SELECT
    USING (organization_id IS NULL OR rapidreach_is_org_member(organization_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "tenant members manage tenant knowledge" ON engineering_knowledge_nodes FOR ALL
    USING (organization_id IS NOT NULL AND rapidreach_has_org_role(organization_id, ARRAY['owner','admin','member']::org_member_role[]))
    WITH CHECK (organization_id IS NOT NULL AND rapidreach_has_org_role(organization_id, ARRAY['owner','admin','member']::org_member_role[]));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "global or tenant knowledge edges are readable" ON engineering_knowledge_edges FOR SELECT
    USING (organization_id IS NULL OR rapidreach_is_org_member(organization_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "tenant members manage tenant knowledge edges" ON engineering_knowledge_edges FOR ALL
    USING (organization_id IS NOT NULL AND rapidreach_has_org_role(organization_id, ARRAY['owner','admin','member']::org_member_role[]))
    WITH CHECK (organization_id IS NOT NULL AND rapidreach_has_org_role(organization_id, ARRAY['owner','admin','member']::org_member_role[]));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE OR REPLACE FUNCTION search_engineering_knowledge(
  query_text TEXT,
  target_org UUID DEFAULT NULL,
  result_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  summary TEXT,
  domain TEXT,
  technology TEXT,
  source_url TEXT,
  source_type TEXT,
  tags TEXT[],
  rank REAL
)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT
    n.id,
    n.title,
    n.summary,
    n.domain,
    n.technology,
    n.source_url,
    n.source_type,
    n.tags,
    ts_rank_cd(n.search_vector, websearch_to_tsquery('english', query_text)) AS rank
  FROM engineering_knowledge_nodes n
  WHERE (n.organization_id IS NULL OR n.organization_id = target_org)
    AND n.search_vector @@ websearch_to_tsquery('english', query_text)
  ORDER BY rank DESC
  LIMIT LEAST(GREATEST(result_limit, 1), 100);
$$;

CREATE OR REPLACE FUNCTION match_engineering_knowledge(
  query_embedding vector(1536),
  target_org UUID DEFAULT NULL,
  match_threshold FLOAT DEFAULT 0.55,
  match_count INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  summary TEXT,
  domain TEXT,
  technology TEXT,
  source_url TEXT,
  source_type TEXT,
  tags TEXT[],
  similarity FLOAT
)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT
    n.id,
    n.title,
    n.summary,
    n.domain,
    n.technology,
    n.source_url,
    n.source_type,
    n.tags,
    1 - (n.embedding <=> query_embedding) AS similarity
  FROM engineering_knowledge_nodes n
  WHERE n.embedding IS NOT NULL
    AND (n.organization_id IS NULL OR n.organization_id = target_org)
    AND 1 - (n.embedding <=> query_embedding) >= match_threshold
  ORDER BY n.embedding <=> query_embedding
  LIMIT LEAST(GREATEST(match_count, 1), 100);
$$;
