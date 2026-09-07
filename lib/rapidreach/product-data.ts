export type Skill = {
  id: string
  name: string
  domain: string
  score: number
  target: number
  dependency?: string
}

export type IntelligenceSignal = {
  id: string
  source: string
  title: string
  impact: 'low' | 'medium' | 'high'
  domain: string
  summary: string
  affected: string[]
  action: string
  status: 'preview'
}

export type StackTechnology = {
  id: string
  name: string
  layer: string
  exposure: 'low' | 'medium' | 'high'
}

export type IncidentScenario = {
  id: string
  title: string
  service: string
  severity: 'SEV-1' | 'SEV-2' | 'SEV-3'
  symptoms: string[]
  evidence: Record<string, string[]>
  choices: { id: string; label: string; score: number; feedback: string }[]
  rootCause: string
  remediation: string
}

export const skills: Skill[] = [
  { id: 'linux', name: 'Linux systems', domain: 'Foundations', score: 78, target: 85 },
  { id: 'networking', name: 'Networking', domain: 'Foundations', score: 43, target: 80, dependency: 'linux' },
  { id: 'containers', name: 'Containers', domain: 'Runtime', score: 82, target: 85, dependency: 'linux' },
  { id: 'kubernetes', name: 'Kubernetes', domain: 'Runtime', score: 72, target: 88, dependency: 'containers' },
  { id: 'gitops', name: 'GitOps', domain: 'Delivery', score: 81, target: 85, dependency: 'kubernetes' },
  { id: 'observability', name: 'Observability', domain: 'Reliability', score: 58, target: 85, dependency: 'networking' },
  { id: 'sre', name: 'SRE & incidents', domain: 'Reliability', score: 49, target: 82, dependency: 'observability' },
  { id: 'security', name: 'Cloud-native security', domain: 'Security', score: 36, target: 78, dependency: 'kubernetes' },
]

export const intelligenceSignals: IntelligenceSignal[] = [
  {
    id: 'rr-signal-1',
    source: 'Ecosystem adapter',
    title: 'Kubernetes control-plane change detected',
    impact: 'medium',
    domain: 'Kubernetes',
    summary: 'Preview signal showing how RapidReach will translate an upstream release into architecture-level impact for a connected stack.',
    affected: ['EKS', 'Cilium', 'Argo CD'],
    action: 'Review API compatibility, rollout sequencing, and cluster add-on support before upgrading.',
    status: 'preview',
  },
  {
    id: 'rr-signal-2',
    source: 'Security adapter',
    title: 'Networking component advisory requires review',
    impact: 'high',
    domain: 'Security',
    summary: 'Preview of stack-aware vulnerability intelligence: not every advisory matters equally to every environment.',
    affected: ['Cilium', 'Kubernetes networking'],
    action: 'Confirm deployed versions, identify reachable workloads, then stage the vendor remediation.',
    status: 'preview',
  },
  {
    id: 'rr-signal-3',
    source: 'Release adapter',
    title: 'GitOps controller update available',
    impact: 'low',
    domain: 'Delivery',
    summary: 'Preview signal for release intelligence enriched with dependency context and recommended engineering action.',
    affected: ['Argo CD'],
    action: 'Read breaking-change notes and validate reconciliation behavior in staging.',
    status: 'preview',
  },
]

export const stackTechnologies: StackTechnology[] = [
  { id: 'aws', name: 'AWS', layer: 'Cloud', exposure: 'medium' },
  { id: 'eks', name: 'EKS', layer: 'Runtime', exposure: 'high' },
  { id: 'terraform', name: 'Terraform', layer: 'Provisioning', exposure: 'medium' },
  { id: 'argocd', name: 'Argo CD', layer: 'Delivery', exposure: 'medium' },
  { id: 'cilium', name: 'Cilium', layer: 'Networking', exposure: 'high' },
  { id: 'prometheus', name: 'Prometheus', layer: 'Observability', exposure: 'low' },
  { id: 'grafana', name: 'Grafana', layer: 'Observability', exposure: 'low' },
  { id: 'vault', name: 'Vault', layer: 'Security', exposure: 'medium' },
]

export const incidents: IncidentScenario[] = [
  {
    id: 'checkout-latency',
    title: 'Checkout latency spike',
    service: 'checkout-api',
    severity: 'SEV-2',
    symptoms: ['p95 latency +430%', 'error rate normal', 'CPU normal', 'database latency +510ms'],
    evidence: {
      metrics: ['checkout p95: 2.8s', 'db query p95: 690ms', 'CPU: 41%', 'memory: 63%'],
      traces: ['83% of request time is inside payment_history query', 'connection acquisition time increased 6x'],
      events: ['database connection pool saturation warning', 'no pod restarts'],
      logs: ['timeout waiting for available DB connection', 'retry budget approaching threshold'],
    },
    choices: [
      { id: 'cpu', label: 'Scale application CPU immediately', score: 0, feedback: 'CPU is healthy. Scaling compute does not address the constrained dependency.' },
      { id: 'db', label: 'Investigate DB pool saturation and slow query path', score: 3, feedback: 'Correct. The evidence converges on database wait time and connection pressure.' },
      { id: 'restart', label: 'Restart every checkout pod', score: 0, feedback: 'This is disruptive and removes evidence without addressing the underlying bottleneck.' },
      { id: 'network', label: 'Disable network policy', score: 1, feedback: 'There is no evidence of denied traffic or packet loss. This increases risk without a strong hypothesis.' },
    ],
    rootCause: 'A slow query increased connection hold time until the checkout database pool saturated, creating queueing latency without raising application CPU or error rate.',
    remediation: 'Mitigate by increasing safe pool headroom or reducing query concurrency, fix/index the query, validate timeout budgets, and add pool-saturation alerts plus a runbook.',
  },
]

export const mcpTools = [
  'search_engineering_knowledge',
  'explain_system',
  'diagnose_incident',
  'recommend_learning',
  'explain_release_impact',
  'review_kubernetes_manifest',
  'generate_runbook',
] as const
