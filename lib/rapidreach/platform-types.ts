export type OrganizationPlan = 'free' | 'pro' | 'team' | 'enterprise'
export type OrganizationRole = 'owner' | 'admin' | 'member' | 'viewer'
export type SignalSeverity = 'low' | 'medium' | 'high' | 'critical'
export type SignalStatus = 'new' | 'reviewing' | 'action_required' | 'resolved' | 'ignored'

export type OrganizationSummary = {
  id: string
  slug: string
  name: string
  plan: OrganizationPlan
  billingStatus: string
  role: OrganizationRole
}

export type StackComponentRecord = {
  id: string
  organizationId: string
  name: string
  slug: string
  kind: string
  technology: string
  version: string | null
  environment: string
  ownerTeam: string | null
  criticality: number
  metadata: Record<string, unknown>
}

export type IntelligenceRecord = {
  id: string
  organizationId: string | null
  sourceProvider: string
  externalId: string
  sourceUrl: string | null
  signalType: string
  title: string
  summary: string
  severity: SignalSeverity
  status: SignalStatus
  domain: string
  technology: string | null
  version: string | null
  recommendedAction: string | null
  publishedAt: string | null
  affectedComponentIds: string[]
  evidence: Record<string, unknown>
}

export type SkillScoreRecord = {
  id: string
  skillKey: string
  skillName: string
  domain: string
  score: number
  target: number
  confidence: number
  assessedAt: string
}

export type IntegrationRecord = {
  id: string
  provider: string
  displayName: string
  status: 'pending' | 'active' | 'error' | 'disabled'
  externalAccountId: string | null
  config: Record<string, unknown>
  lastSyncedAt: string | null
  lastError: string | null
}

export type UsageSummary = {
  meter: string
  quantity: number
}

export type PlatformSnapshot = {
  organization: OrganizationSummary
  stack: StackComponentRecord[]
  signals: IntelligenceRecord[]
  skills: SkillScoreRecord[]
  integrations: IntegrationRecord[]
  usage: UsageSummary[]
}

export const PLAN_LIMITS: Record<OrganizationPlan, {
  members: number
  stackComponents: number
  monthlyMcpCalls: number
  integrations: number
}> = {
  free: { members: 1, stackComponents: 10, monthlyMcpCalls: 250, integrations: 1 },
  pro: { members: 1, stackComponents: 100, monthlyMcpCalls: 5_000, integrations: 5 },
  team: { members: 50, stackComponents: 2_000, monthlyMcpCalls: 100_000, integrations: 25 },
  enterprise: { members: 100_000, stackComponents: 100_000, monthlyMcpCalls: 10_000_000, integrations: 500 },
}
