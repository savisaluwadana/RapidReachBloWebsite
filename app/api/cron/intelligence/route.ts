import { NextRequest, NextResponse } from 'next/server'
import { runIntelligenceIngestion } from '@/lib/rapidreach/ingestion/pipeline'
import { syncAllIntegrations } from '@/lib/rapidreach/integrations/sync'

export const runtime = 'nodejs'
export const maxDuration = 300

function authorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const bearer = request.headers.get('authorization')
  return bearer === `Bearer ${secret}` || request.headers.get('x-cron-secret') === secret
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const integrationResults = await syncAllIntegrations()
    const intelligence = await runIntelligenceIngestion()
    return NextResponse.json({ integrations: integrationResults, intelligence })
  } catch (error) {
    console.error('RapidReach background intelligence worker failed', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Background worker failed' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return POST(request)
}
