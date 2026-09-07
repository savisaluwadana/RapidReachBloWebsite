import type { IntelligenceAdapter, IngestedSignal } from './types'

const DEFAULT_REPOSITORIES = [
  'kubernetes/kubernetes',
  'cilium/cilium',
  'argoproj/argo-cd',
  'prometheus/prometheus',
  'grafana/grafana',
  'hashicorp/terraform',
  'backstage/backstage',
]

const projectMetadata: Record<string, { technology: string; domain: string }> = {
  'kubernetes/kubernetes': { technology: 'Kubernetes', domain: 'Runtime' },
  'cilium/cilium': { technology: 'Cilium', domain: 'Networking' },
  'argoproj/argo-cd': { technology: 'Argo CD', domain: 'Delivery' },
  'prometheus/prometheus': { technology: 'Prometheus', domain: 'Observability' },
  'grafana/grafana': { technology: 'Grafana', domain: 'Observability' },
  'hashicorp/terraform': { technology: 'Terraform', domain: 'Infrastructure' },
  'backstage/backstage': { technology: 'Backstage', domain: 'Platform Engineering' },
}

type GitHubRelease = {
  id: number
  html_url: string
  tag_name: string
  name: string | null
  body: string | null
  draft: boolean
  prerelease: boolean
  published_at: string | null
}

function releaseSummary(body: string | null) {
  const normalized = (body ?? '').replace(/\r/g, '').replace(/\n{3,}/g, '\n\n').trim()
  if (!normalized) return 'A new upstream release is available. Review compatibility, breaking changes, and rollout sequencing before adoption.'
  return normalized.slice(0, 900)
}

export class GitHubReleaseAdapter implements IntelligenceAdapter {
  readonly name = 'github-releases'

  constructor(private readonly repositories = configuredRepositories()) {}

  async fetchSignals(): Promise<IngestedSignal[]> {
    const signals: IngestedSignal[] = []
    for (const repository of this.repositories) {
      const url = `https://api.github.com/repos/${repository}/releases?per_page=8`
      const response = await fetch(url, {
        headers: {
          Accept: 'application/vnd.github+json',
          'User-Agent': 'RapidReach-Engineering-Intelligence',
          ...(process.env.RAPIDREACH_GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.RAPIDREACH_GITHUB_TOKEN}` } : {}),
        },
        next: { revalidate: 0 },
      })
      if (!response.ok) throw new Error(`GitHub ${repository}: ${response.status} ${response.statusText}`)
      const releases = await response.json() as GitHubRelease[]
      const meta = projectMetadata[repository] ?? { technology: repository.split('/').pop() ?? repository, domain: 'Cloud Native' }
      for (const release of releases) {
        if (release.draft || !release.published_at) continue
        signals.push({
          sourceProvider: 'github',
          externalId: `${repository}:release:${release.id}`,
          sourceUrl: release.html_url,
          signalType: 'release',
          title: `${meta.technology} ${release.name || release.tag_name} released`,
          summary: releaseSummary(release.body),
          severity: release.prerelease ? 'low' : 'medium',
          domain: meta.domain,
          technology: meta.technology,
          version: release.tag_name,
          recommendedAction: 'Review upstream release notes, compatibility constraints, breaking changes, and a staged rollout plan against the connected stack.',
          publishedAt: release.published_at,
          evidence: { repository, prerelease: release.prerelease },
          rawPayload: { id: release.id, repository, tag_name: release.tag_name, name: release.name, prerelease: release.prerelease },
        })
      }
    }
    return signals
  }
}

function configuredRepositories() {
  const configured = process.env.RAPIDREACH_GITHUB_REPOS
    ?.split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  return configured?.length ? configured : DEFAULT_REPOSITORIES
}
