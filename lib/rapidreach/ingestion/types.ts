import type { SignalSeverity } from '@/lib/rapidreach/platform-types'

export type IngestedSignal = {
  sourceProvider: string
  externalId: string
  sourceUrl?: string
  signalType: 'release' | 'security' | 'cloud-change' | 'project-news'
  title: string
  summary: string
  severity: SignalSeverity
  domain: string
  technology?: string
  version?: string
  recommendedAction?: string
  publishedAt?: string
  evidence?: Record<string, unknown>
  rawPayload?: Record<string, unknown>
}

export type IngestionResult = {
  adapter: string
  fetched: number
  stored: number
  matched: number
  errors: string[]
}

export interface IntelligenceAdapter {
  readonly name: string
  fetchSignals(): Promise<IngestedSignal[]>
}
