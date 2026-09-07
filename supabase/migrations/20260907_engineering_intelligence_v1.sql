-- RapidReach Engineering Intelligence OS v1
-- Multi-tenant production data model for organizations, stacks, intelligence,
-- skills, labs, billing, metering, integrations, MCP/API access, and auditability.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
  CREATE TYPE org_member_role AS ENUM ('owner', 'admin', 'member', 'viewer');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE org_member_status AS ENUM ('invited', 'active', 'suspended');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE integration_status AS ENUM ('pending', 'active', 'error', 'disabled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE signal_severity AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE signal_status AS ENUM ('new', 'reviewing', 'action_required', 'resolved', 'ignored');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL CHECK (slug ~ '^[a-z0-9][a-z0-9-]{1,62}$'),
  name TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'team', 'enterprise')),
  created_by UUID NOT NULL REFERENCES user_profiles(id) ON DELETE RESTRICT,
  billing_customer_id TEXT UNIQUE,
  billing_subscription_id TEXT UNIQUE,
  billing_status TEXT NOT NULL DEFAULT 'inactive',
  sso_domain TEXT,
  sso_provider_id TEXT,
  sso_enforced BOOLEAN NOT NULL DEFAULT FALSE,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  role org_member_role NOT NULL DEFAULT 'member',
  status org_member_status NOT NULL DEFAULT 'active',
  invited_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  joined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

CREATE OR REPLACE FUNCTION rapidreach_add_org_owner()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO organization_members (organization_id, user_id, role, status, joined_at)
  VALUES (NEW.id, NEW.created_by, 'owner', 'active', NOW())
  ON CONFLICT (organization_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_rapidreach_add_org_owner ON organizations;
CREATE TRIGGER trg_rapidreach_add_org_owner
AFTER INSERT ON organizations
FOR EACH ROW EXECUTE FUNCTION rapidreach_add_org_owner();

CREATE TABLE IF NOT EXISTS integration_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  display_name TEXT NOT NULL,
  status integration_status NOT NULL DEFAULT 'pending',
  external_account_id TEXT,
  credential_ref TEXT,
  config JSONB NOT NULL DEFAULT '{}',
  sync_cursor TEXT,
  last_synced_at TIMESTAMPTZ,
  last_error TEXT,
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, provider, display_name)
);

CREATE TABLE IF NOT EXISTS stack_components (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  integration_id UUID REFERENCES integration_connections(id) ON DELETE SET NULL,
  external_id TEXT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  kind TEXT NOT NULL,
  technology TEXT NOT NULL,
  version TEXT,
  environment TEXT NOT NULL DEFAULT 'production',
  owner_team TEXT,
  criticality INTEGER NOT NULL DEFAULT 2 CHECK (criticality BETWEEN 1 AND 5),
  metadata JSONB NOT NULL DEFAULT '{}',
  discovered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, slug, environment)
);

CREATE TABLE IF NOT EXISTS stack_edges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  from_component_id UUID NOT NULL REFERENCES stack_components(id) ON DELETE CASCADE,
  to_component_id UUID NOT NULL REFERENCES stack_components(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, from_component_id, to_component_id, relationship)
);

CREATE TABLE IF NOT EXISTS intelligence_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  source_provider TEXT NOT NULL,
  external_id TEXT NOT NULL,
  source_url TEXT,
  signal_type TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  severity signal_severity NOT NULL DEFAULT 'medium',
  status signal_status NOT NULL DEFAULT 'new',
  domain TEXT NOT NULL,
  technology TEXT,
  version TEXT,
  recommended_action TEXT,
  published_at TIMESTAMPTZ,
  affected_component_ids UUID[] NOT NULL DEFAULT '{}',
  evidence JSONB NOT NULL DEFAULT '{}',
  raw_payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, source_provider, external_id)
);

CREATE TABLE IF NOT EXISTS intelligence_notification_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  minimum_severity signal_severity NOT NULL DEFAULT 'high',
  domains TEXT[] NOT NULL DEFAULT '{}',
  technologies TEXT[] NOT NULL DEFAULT '{}',
  channels JSONB NOT NULL DEFAULT '{"in_app": true}',
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_skill_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  skill_key TEXT NOT NULL,
  skill_name TEXT NOT NULL,
  domain TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  target INTEGER NOT NULL DEFAULT 80 CHECK (target BETWEEN 0 AND 100),
  confidence NUMERIC(4,3) NOT NULL DEFAULT 0.500 CHECK (confidence BETWEEN 0 AND 1),
  evidence JSONB NOT NULL DEFAULT '[]',
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, organization_id, skill_key)
);

CREATE TABLE IF NOT EXISTS lab_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  scenario_key TEXT NOT NULL,
  run_type TEXT NOT NULL DEFAULT 'human',
  status TEXT NOT NULL DEFAULT 'started',
  score INTEGER,
  max_score INTEGER,
  evidence JSONB NOT NULL DEFAULT '{}',
  actions JSONB NOT NULL DEFAULT '[]',
  result JSONB NOT NULL DEFAULT '{}',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS agent_evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  agent_name TEXT NOT NULL,
  agent_version TEXT,
  scenario_key TEXT NOT NULL,
  score NUMERIC(6,2),
  dimensions JSONB NOT NULL DEFAULT '{}',
  unsafe_actions JSONB NOT NULL DEFAULT '[]',
  trace JSONB NOT NULL DEFAULT '[]',
  result JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usage_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  meter TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  idempotency_key TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, idempotency_key)
);

CREATE TABLE IF NOT EXISTS billing_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider TEXT NOT NULL DEFAULT 'stripe',
  provider_event_id TEXT NOT NULL UNIQUE,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  scopes TEXT[] NOT NULL DEFAULT '{mcp:read}',
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organization_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  actor_user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  actor_type TEXT NOT NULL DEFAULT 'user',
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  request_id TEXT,
  ip_address INET,
  details JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS worker_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_name TEXT NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  stats JSONB NOT NULL DEFAULT '{}',
  error TEXT
);

CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id, status);
CREATE INDEX IF NOT EXISTS idx_integrations_org_provider ON integration_connections(organization_id, provider, status);
CREATE INDEX IF NOT EXISTS idx_stack_components_org_tech ON stack_components(organization_id, technology, environment);
CREATE INDEX IF NOT EXISTS idx_stack_edges_org ON stack_edges(organization_id);
CREATE INDEX IF NOT EXISTS idx_signals_org_created ON intelligence_signals(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_signals_org_severity ON intelligence_signals(organization_id, severity, status);
CREATE INDEX IF NOT EXISTS idx_signals_tech ON intelligence_signals(technology);
CREATE INDEX IF NOT EXISTS idx_skill_scores_user ON user_skill_scores(user_id, organization_id);
CREATE INDEX IF NOT EXISTS idx_lab_runs_org_user ON lab_runs(organization_id, user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_evals_org ON agent_evaluations(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_org_meter ON usage_events(organization_id, meter, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys(key_prefix) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_org_audit_org ON organization_audit_log(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_worker_runs_job ON worker_runs(job_name, started_at DESC);

CREATE OR REPLACE FUNCTION rapidreach_is_org_member(target_org UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = target_org
      AND user_id = auth.uid()
      AND status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION rapidreach_has_org_role(target_org UUID, allowed_roles org_member_role[])
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = target_org
      AND user_id = auth.uid()
      AND status = 'active'
      AND role = ANY(allowed_roles)
  );
$$;

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE stack_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE stack_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE intelligence_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE intelligence_notification_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skill_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_runs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "org members can view organizations" ON organizations FOR SELECT
    USING (rapidreach_is_org_member(id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "users can create organizations" ON organizations FOR INSERT
    WITH CHECK (created_by = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "org admins can update organizations" ON organizations FOR UPDATE
    USING (rapidreach_has_org_role(id, ARRAY['owner','admin']::org_member_role[]));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "members can view org membership" ON organization_members FOR SELECT
    USING (rapidreach_is_org_member(organization_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "admins manage org membership" ON organization_members FOR ALL
    USING (rapidreach_has_org_role(organization_id, ARRAY['owner','admin']::org_member_role[]))
    WITH CHECK (rapidreach_has_org_role(organization_id, ARRAY['owner','admin']::org_member_role[]));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "members view integrations" ON integration_connections FOR SELECT
    USING (rapidreach_is_org_member(organization_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "admins manage integrations" ON integration_connections FOR ALL
    USING (rapidreach_has_org_role(organization_id, ARRAY['owner','admin']::org_member_role[]))
    WITH CHECK (rapidreach_has_org_role(organization_id, ARRAY['owner','admin']::org_member_role[]));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "members view stack" ON stack_components FOR SELECT
    USING (rapidreach_is_org_member(organization_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "members manage stack" ON stack_components FOR ALL
    USING (rapidreach_has_org_role(organization_id, ARRAY['owner','admin','member']::org_member_role[]))
    WITH CHECK (rapidreach_has_org_role(organization_id, ARRAY['owner','admin','member']::org_member_role[]));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "members view stack edges" ON stack_edges FOR SELECT
    USING (rapidreach_is_org_member(organization_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "members manage stack edges" ON stack_edges FOR ALL
    USING (rapidreach_has_org_role(organization_id, ARRAY['owner','admin','member']::org_member_role[]))
    WITH CHECK (rapidreach_has_org_role(organization_id, ARRAY['owner','admin','member']::org_member_role[]));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "public global intelligence is readable" ON intelligence_signals FOR SELECT
    USING (organization_id IS NULL OR rapidreach_is_org_member(organization_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "members update org intelligence status" ON intelligence_signals FOR UPDATE
    USING (organization_id IS NOT NULL AND rapidreach_has_org_role(organization_id, ARRAY['owner','admin','member']::org_member_role[]));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "members view notification rules" ON intelligence_notification_rules FOR SELECT
    USING (rapidreach_is_org_member(organization_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "admins manage notification rules" ON intelligence_notification_rules FOR ALL
    USING (rapidreach_has_org_role(organization_id, ARRAY['owner','admin']::org_member_role[]))
    WITH CHECK (rapidreach_has_org_role(organization_id, ARRAY['owner','admin']::org_member_role[]));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "users view own skills" ON user_skill_scores FOR SELECT
    USING (user_id = auth.uid() AND (organization_id IS NULL OR rapidreach_is_org_member(organization_id)));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "users manage own skills" ON user_skill_scores FOR ALL
    USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "members view lab runs" ON lab_runs FOR SELECT
    USING (user_id = auth.uid() OR (organization_id IS NOT NULL AND rapidreach_is_org_member(organization_id)));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "users create lab runs" ON lab_runs FOR INSERT
    WITH CHECK (user_id = auth.uid() AND (organization_id IS NULL OR rapidreach_is_org_member(organization_id)));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "members view agent evaluations" ON agent_evaluations FOR SELECT
    USING (organization_id IS NULL OR rapidreach_is_org_member(organization_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "members create agent evaluations" ON agent_evaluations FOR INSERT
    WITH CHECK (created_by = auth.uid() AND (organization_id IS NULL OR rapidreach_is_org_member(organization_id)));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "members view usage" ON usage_events FOR SELECT
    USING (organization_id IS NOT NULL AND rapidreach_has_org_role(organization_id, ARRAY['owner','admin']::org_member_role[]));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "admins view API keys" ON api_keys FOR SELECT
    USING (rapidreach_has_org_role(organization_id, ARRAY['owner','admin']::org_member_role[]));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "admins manage API keys" ON api_keys FOR ALL
    USING (rapidreach_has_org_role(organization_id, ARRAY['owner','admin']::org_member_role[]))
    WITH CHECK (rapidreach_has_org_role(organization_id, ARRAY['owner','admin']::org_member_role[]));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "admins view audit logs" ON organization_audit_log FOR SELECT
    USING (rapidreach_has_org_role(organization_id, ARRAY['owner','admin']::org_member_role[]));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- billing_events and worker_runs intentionally have no user policies.
-- They are service-role-only operational tables.
