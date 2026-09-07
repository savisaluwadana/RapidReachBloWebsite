CREATE TABLE IF NOT EXISTS organization_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role org_member_role NOT NULL DEFAULT 'member',
  token_hash TEXT NOT NULL UNIQUE,
  invited_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_org_invitations_org ON organization_invitations(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_org_invitations_email ON organization_invitations(lower(email));

ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "admins view organization invitations" ON organization_invitations FOR SELECT
    USING (rapidreach_has_org_role(organization_id, ARRAY['owner','admin']::org_member_role[]));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "admins create organization invitations" ON organization_invitations FOR INSERT
    WITH CHECK (rapidreach_has_org_role(organization_id, ARRAY['owner','admin']::org_member_role[]));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "admins revoke organization invitations" ON organization_invitations FOR UPDATE
    USING (rapidreach_has_org_role(organization_id, ARRAY['owner','admin']::org_member_role[]));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
