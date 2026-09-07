import { NextRequest, NextResponse } from 'next/server'
import { parseStripeEvent, processStripeEvent, verifyStripeWebhook } from '@/lib/rapidreach/billing'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const payload = await request.text()
  const signature = request.headers.get('stripe-signature')
  if (!verifyStripeWebhook(payload, signature)) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
  }
  try {
    const event = parseStripeEvent(payload)
    const result = await processStripeEvent(event)
    return NextResponse.json({ received: true, ...result })
  } catch (error) {
    console.error('Stripe webhook processing failed', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Webhook processing failed' }, { status: 500 })
  }
}
