'use server'

import { createHash, randomBytes } from 'crypto'
import { revalidatePath } from 'next/cache'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { writeAudit } from '@/lib/actions/platform'
import type { OrganizationRole } from '@/lib/rapidreach/platform-types'

async function requireOrgAdmin(organizationId: string) {
  const supabase = await createClient()
  if (!supabase) throw new Error('Supabase is not configured')
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Authentication required')
  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()
  if (!membership || !['owner', 'admin'].includes(String(membership.role))) throw new Error('Organization admin access required')
  return { supabase, user }
}

export async function updateOrganizationSecurity(input: {
  organizationId: string
  ssoDomain?: string
  ssoProviderId?: string
  ssoEnforced?: boolean
}) {
  const { supabase, user } = await requireOrgAdmin(input.organizationId)
  const { error } = await supabase.from('organizations').update({
    sso_domain: input.ssoDomain?.trim().toLowerCase() || null,
    sso_provider_id: input.ssoProviderId?.trim() || null,
    sso_enforced: Boolean(input.ssoEnforced),
    updated_at: new Date().toISOString(),
  }).eq('id', input.organizationId)
  if (error) throw error
  await writeAudit(input.organizationId, user.id, 'organization.sso_updated', 'organization', input.organizationId, {
    domain: input.ssoDomain?.trim().toLowerCase() || null,
    providerIdConfigured: Boolean(input.ssoProviderId?.trim()),
    enforced: Boolean(input.ssoEnforced),
  })
  revalidatePath('/settings/platform')
}

export async function createOrganizationInvitation(input: {
  organizationId: string
  email: string
  role?: Exclude<OrganizationRole, 'owner'>
}) {
  const { supabase, user } = await requireOrgAdmin(input.organizationId)
  const email = input.email.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email address')
  const rawToken = `rri_${randomBytes(32).toString('base64url')}`
  const tokenHash = createHash('sha256').update(rawToken).digest('hex')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data, error } = await supabase.from('organization_invitations').insert({
    organization_id: input.organizationId,
    email,
    role: input.role ?? 'member',
    token_hash: tokenHash,
    invited_by: user.id,
    expires_at: expiresAt,
  }).select('id').single()
  if (error) throw error
  await writeAudit(input.organizationId, user.id, 'member.invited', 'organization_invitation', String(data.id), { email, role: input.role ?? 'member' })
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '')
  const invitePath = `/invite/${encodeURIComponent(rawToken)}`
  revalidatePath('/settings/platform')
  return { inviteUrl: appUrl ? `${appUrl}${invitePath}` : invitePath, expiresAt }
}

export async function acceptOrganizationInvitation(rawToken: string) {
  const { supabase, user } = await (async () => {
    const client = await createClient()
    if (!client) throw new Error('Supabase is not configured')
    const { data: { user: currentUser } } = await client.auth.getUser()
    if (!currentUser?.email) throw new Error('Sign in with the invited email address first')
    return { supabase: client, user: currentUser }
  })()
  const service = createServiceRoleClient()
  if (!service) throw new Error('Invitation service unavailable')
  const tokenHash = createHash('sha256').update(rawToken).digest('hex')
  const { data: invitation, error } = await service.from('organization_invitations').select('*').eq('token_hash', tokenHash).maybeSingle()
  if (error || !invitation) throw new Error('Invitation not found')
  if (invitation.revoked_at || invitation.accepted_at) throw new Error('Invitation is no longer active')
  if (new Date(String(invitation.expires_at)).getTime() <= Date.now()) throw new Error('Invitation has expired')
  if (String(invitation.email).toLowerCase() !== user.email.toLowerCase()) throw new Error('This invitation belongs to a different email address')

  const { error: memberError } = await service.from('organization_members').upsert({
    organization_id: invitation.organization_id,
    user_id: user.id,
    role: invitation.role,
    status: 'active',
    invited_by: invitation.invited_by,
    joined_at: new Date().toISOString(),
  }, { onConflict: 'organization_id,user_id' })
  if (memberError) throw memberError
  await service.from('organization_invitations').update({ accepted_at: new Date().toISOString() }).eq('id', invitation.id)
  await writeAudit(String(invitation.organization_id), user.id, 'member.joined', 'organization_member', user.id, { email: user.email })
  revalidatePath('/teams')
  revalidatePath('/settings/platform')
  return { organizationId: String(invitation.organization_id) }
}

export async function removeOrganizationMember(input: { organizationId: string; userId: string }) {
  const { supabase, user } = await requireOrgAdmin(input.organizationId)
  if (input.userId === user.id) throw new Error('Use organization ownership transfer before removing yourself')
  const { data: target } = await supabase.from('organization_members').select('role').eq('organization_id', input.organizationId).eq('user_id', input.userId).maybeSingle()
  if (target?.role === 'owner') throw new Error('The organization owner cannot be removed')
  const { error } = await supabase.from('organization_members').delete().eq('organization_id', input.organizationId).eq('user_id', input.userId)
  if (error) throw error
  await writeAudit(input.organizationId, user.id, 'member.removed', 'organization_member', input.userId)
  revalidatePath('/settings/platform')
}

export async function getOrganizationAdminData(organizationId: string) {
  const { supabase } = await requireOrgAdmin(organizationId)
  const [orgResult, memberResult, invitationResult] = await Promise.all([
    supabase.from('organizations').select('id, name, slug, plan, billing_status, billing_customer_id, sso_domain, sso_provider_id, sso_enforced').eq('id', organizationId).single(),
    supabase.from('organization_members').select('user_id, role, status, joined_at, user_profiles(email, full_name)').eq('organization_id', organizationId).order('created_at', { ascending: true }),
    supabase.from('organization_invitations').select('id, email, role, expires_at, accepted_at, revoked_at, created_at').eq('organization_id', organizationId).order('created_at', { ascending: false }).limit(20),
  ])
  if (orgResult.error) throw orgResult.error
  return { organization: orgResult.data, members: memberResult.data ?? [], invitations: invitationResult.data ?? [] }
}
