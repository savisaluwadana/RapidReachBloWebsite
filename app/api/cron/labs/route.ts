import { NextRequest, NextResponse } from 'next/server'
import { cleanupExpiredLabs, labsConfigured } from '@/lib/rapidreach/labs/kubernetes'

export const runtime = 'nodejs'
export const maxDuration = 120

export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  const authorized = Boolean(secret) && (request.headers.get('authorization') === `Bearer ${secret}` || request.headers.get('x-cron-secret') === secret)
  if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!labsConfigured()) return NextResponse.json({ skipped: true, reason: 'Lab cluster is not configured' })
  try {
    const deleted = await cleanupExpiredLabs()
    return NextResponse.json({ deleted, count: deleted.length })
  } catch (error) {
    console.error('Lab cleanup failed', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Lab cleanup failed' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) { return POST(request) }
