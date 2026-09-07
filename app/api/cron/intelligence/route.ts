import { NextRequest, NextResponse } from 'next/server'
import { runIntelligenceIngestion } from '@/lib/rapidreach/ingestion/pipeline'

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
    const result = await runIntelligenceIngestion()
    return NextResponse.json(result)
  } catch (error) {
    console.error('RapidReach intelligence ingestion failed', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Ingestion failed' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return POST(request)
}
