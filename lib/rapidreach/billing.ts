import { createHmac, timingSafeEqual } from 'crypto'
import { createServiceRoleClient } from '@/lib/supabase/server'
import type { OrganizationPlan } from '@/lib/rapidreach/platform-types'

const STRIPE_API = 'https://api.stripe.com/v1'

export const BILLING_PLANS: Record<Exclude<OrganizationPlan, 'free' | 'enterprise'>, {
  label: string
  priceEnv: string
}> = {
  pro: { label: 'RapidReach Pro', priceEnv: 'STRIPE_PRICE_PRO' },
  team: { label: 'RapidReach Team', priceEnv: 'STRIPE_PRICE_TEAM' },
}

type StripeEvent = {
  id: string
  type: string
  data: { object: Record<string, unknown> }
}

function stripeSecret() {
  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret) throw new Error('STRIPE_SECRET_KEY is not configured')
  return secret
}

async function stripeRequest(path: string, params: URLSearchParams) {
  const response = await fetch(`${STRIPE_API}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stripeSecret()}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
    cache: 'no-store',
  })
  const payload = await response.json() as Record<string, unknown>
  if (!response.ok) {
    const error = payload.error as Record<string, unknown> | undefined
    throw new Error(String(error?.message ?? `Stripe request failed with ${response.status}`))
  }
  return payload
}

export async function createCheckoutSession(input: {
  organizationId: string
  plan: 'pro' | 'team'
  customerId?: string | null
  customerEmail?: string | null
}) {
  const priceId = process.env[BILLING_PLANS[input.plan].priceEnv]
  if (!priceId) throw new Error(`${BILLING_PLANS[input.plan].priceEnv} is not configured`)
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '')
  if (!appUrl) throw new Error('NEXT_PUBLIC_APP_URL is not configured')

  let customerId = input.customerId ?? null
  if (!customerId) {
    const customerParams = new URLSearchParams()
    if (input.customerEmail) customerParams.set('email', input.customerEmail)
    customerParams.set('metadata[organization_id]', input.organizationId)
    const customer = await stripeRequest('/customers', customerParams)
    customerId = String(customer.id)
  }

  const params = new URLSearchParams({
    mode: 'subscription',
    customer: customerId,
    'line_items[0][price]': priceId,
    'line_items[0][quantity]': '1',
    client_reference_id: input.organizationId,
    success_url: `${appUrl}/settings/platform?billing=success`,
    cancel_url: `${appUrl}/settings/platform?billing=cancelled`,
    'metadata[organization_id]': input.organizationId,
    'metadata[plan]': input.plan,
    'subscription_data[metadata][organization_id]': input.organizationId,
    'subscription_data[metadata][plan]': input.plan,
    allow_promotion_codes: 'true',
  })
  const session = await stripeRequest('/checkout/sessions', params)
  return { id: String(session.id), url: String(session.url), customerId }
}

export async function createBillingPortal(customerId: string) {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '')
  if (!appUrl) throw new Error('NEXT_PUBLIC_APP_URL is not configured')
  const params = new URLSearchParams({ customer: customerId, return_url: `${appUrl}/settings/platform` })
  const session = await stripeRequest('/billing_portal/sessions', params)
  return { url: String(session.url) }
}

export function verifyStripeWebhook(payload: string, signatureHeader: string | null) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret || !signatureHeader) return false
  const parts = signatureHeader.split(',').map((part) => part.split('=', 2))
  const timestamp = parts.find(([key]) => key === 't')?.[1]
  const signatures = parts.filter(([key]) => key === 'v1').map(([, value]) => value)
  if (!timestamp || !signatures.length) return false
  const timestampMs = Number(timestamp) * 1000
  if (!Number.isFinite(timestampMs) || Math.abs(Date.now() - timestampMs) > 5 * 60 * 1000) return false
  const expected = createHmac('sha256', secret).update(`${timestamp}.${payload}`).digest('hex')
  const expectedBuffer = Buffer.from(expected)
  return signatures.some((candidate) => {
    const candidateBuffer = Buffer.from(candidate)
    return candidateBuffer.length === expectedBuffer.length && timingSafeEqual(candidateBuffer, expectedBuffer)
  })
}

export async function processStripeEvent(event: StripeEvent) {
  const service = createServiceRoleClient()
  if (!service) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for billing webhooks')

  const { data: existing } = await service.from('billing_events').select('id').eq('provider_event_id', event.id).maybeSingle()
  if (existing) return { duplicate: true }

  const object = event.data.object
  const metadata = (object.metadata ?? {}) as Record<string, unknown>
  const organizationId = metadata.organization_id ? String(metadata.organization_id) : null
  const customerId = object.customer ? String(object.customer) : null
  const subscriptionId = object.subscription ? String(object.subscription) : (event.type.startsWith('customer.subscription.') && object.id ? String(object.id) : null)
  const plan = metadata.plan ? String(metadata.plan) as OrganizationPlan : null
  const status = object.status ? String(object.status) : null

  let resolvedOrgId = organizationId
  if (!resolvedOrgId && subscriptionId) {
    const { data } = await service.from('organizations').select('id').eq('billing_subscription_id', subscriptionId).maybeSingle()
    if (data) resolvedOrgId = String(data.id)
  }
  if (!resolvedOrgId && customerId) {
    const { data } = await service.from('organizations').select('id').eq('billing_customer_id', customerId).maybeSingle()
    if (data) resolvedOrgId = String(data.id)
  }

  if (resolvedOrgId) {
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (customerId) updates.billing_customer_id = customerId
    if (subscriptionId) updates.billing_subscription_id = subscriptionId
    if (plan && ['pro', 'team', 'enterprise'].includes(plan)) updates.plan = plan

    switch (event.type) {
      case 'checkout.session.completed':
        updates.billing_status = 'active'
        break
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        updates.billing_status = status ?? 'active'
        break
      case 'customer.subscription.deleted':
        updates.billing_status = 'cancelled'
        updates.plan = 'free'
        updates.billing_subscription_id = null
        break
      case 'invoice.paid':
        updates.billing_status = 'active'
        break
      case 'invoice.payment_failed':
        updates.billing_status = 'past_due'
        break
    }
    await service.from('organizations').update(updates).eq('id', resolvedOrgId)
  }

  const { error } = await service.from('billing_events').insert({
    provider: 'stripe',
    provider_event_id: event.id,
    organization_id: resolvedOrgId,
    event_type: event.type,
    payload: event as unknown as Record<string, unknown>,
  })
  if (error) throw error
  return { duplicate: false, organizationId: resolvedOrgId }
}

export function parseStripeEvent(payload: string) {
  const parsed = JSON.parse(payload) as StripeEvent
  if (!parsed.id || !parsed.type || !parsed.data?.object) throw new Error('Invalid Stripe event payload')
  return parsed
}
