import type { IntelligenceAdapter, IngestedSignal } from './types'
import type { SignalSeverity } from '@/lib/rapidreach/platform-types'

const DEFAULT_TECHNOLOGIES = ['Kubernetes', 'Cilium', 'Argo CD', 'Prometheus', 'Grafana', 'Terraform', 'Backstage']

type NvdCve = {
  id: string
  published: string
  lastModified: string
  descriptions?: Array<{ lang: string; value: string }>
  references?: Array<{ url: string }>
  metrics?: Record<string, Array<{ cvssData?: { baseScore?: number; baseSeverity?: string } }>>
}

type NvdResponse = {
  vulnerabilities?: Array<{ cve: NvdCve }>
}

function severityFor(cve: NvdCve): SignalSeverity {
  const metricGroups = Object.values(cve.metrics ?? {})
  for (const group of metricGroups) {
    for (const metric of group) {
      const severity = metric.cvssData?.baseSeverity?.toUpperCase()
      const score = metric.cvssData?.baseScore ?? 0
      if (severity === 'CRITICAL' || score >= 9) return 'critical'
      if (severity === 'HIGH' || score >= 7) return 'high'
      if (severity === 'MEDIUM' || score >= 4) return 'medium'
    }
  }
  return 'medium'
}

function englishDescription(cve: NvdCve) {
  return cve.descriptions?.find((item) => item.lang === 'en')?.value ?? 'A security advisory was published for a technology in the connected engineering ecosystem.'
}

export class NvdSecurityAdapter implements IntelligenceAdapter {
  readonly name = 'nvd-security'

  constructor(private readonly technologies = configuredTechnologies()) {}

  async fetchSignals(): Promise<IngestedSignal[]> {
    const signals: IngestedSignal[] = []
    const end = new Date()
    const start = new Date(end.getTime() - 72 * 60 * 60 * 1000)

    for (const technology of this.technologies) {
      const params = new URLSearchParams({
        keywordSearch: technology,
        pubStartDate: start.toISOString(),
        pubEndDate: end.toISOString(),
        resultsPerPage: '50',
      })
      const response = await fetch(`https://services.nvd.nist.gov/rest/json/cves/2.0?${params}`, {
        headers: {
          'User-Agent': 'RapidReach-Engineering-Intelligence/1.0',
          ...(process.env.NVD_API_KEY ? { apiKey: process.env.NVD_API_KEY } : {}),
        },
        next: { revalidate: 0 },
      })
      if (!response.ok) throw new Error(`NVD ${technology}: ${response.status} ${response.statusText}`)
      const payload = await response.json() as NvdResponse
      for (const item of payload.vulnerabilities ?? []) {
        const cve = item.cve
        const severity = severityFor(cve)
        signals.push({
          sourceProvider: 'nvd',
          externalId: `${technology.toLowerCase().replace(/\s+/g, '-')}:${cve.id}`,
          sourceUrl: cve.references?.[0]?.url ?? `https://nvd.nist.gov/vuln/detail/${cve.id}`,
          signalType: 'security',
          title: `${cve.id} may affect ${technology}`,
          summary: englishDescription(cve),
          severity,
          domain: 'Security',
          technology,
          recommendedAction: 'Confirm whether the affected product/version is present, determine exploitability and exposure, then follow the vendor remediation with staged verification.',
          publishedAt: cve.published,
          evidence: { cve: cve.id, lastModified: cve.lastModified },
          rawPayload: { id: cve.id, published: cve.published, lastModified: cve.lastModified },
        })
      }
    }
    return signals
  }
}

function configuredTechnologies() {
  const configured = process.env.RAPIDREACH_SECURITY_TECHNOLOGIES
    ?.split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  return configured?.length ? configured : DEFAULT_TECHNOLOGIES
}
