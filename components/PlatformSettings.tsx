'use client'

import { FormEvent, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Building2, CloudCog, CreditCard, KeyRound, Network, ShieldCheck, UserPlus } from 'lucide-react'
import { createMcpApiKey, createOrganization, saveIntegration, upsertStackComponent } from '@/lib/actions/platform'
import { createOrganizationInvitation, updateOrganizationSecurity } from '@/lib/actions/organization'
import type { OrganizationSummary, PlatformSnapshot } from '@/lib/rapidreach/platform-types'

type AdminData = {
  organization: {
    id: string
    name: string
    slug: string
    plan: string
    billing_status: string
    billing_customer_id: string | null
    sso_domain: string | null
    sso_provider_id: string | null
    sso_enforced: boolean
  }
  members: Array<{
    user_id: string
    role: string
    status: string
    joined_at: string | null
    user_profiles: { email?: string; full_name?: string } | Array<{ email?: string; full_name?: string }> | null
  }>
  invitations: Array<{
    id: string
    email: string
    role: string
    expires_at: string
    accepted_at: string | null
    revoked_at: string | null
    created_at: string
  }>
}

type ApiKeyRow = {
  id: string
  name: string
  key_prefix: string
  scopes: string[] | null
  last_used_at: string | null
  expires_at: string | null
  revoked_at: string | null
  created_at: string
}

export default function PlatformSettings({
  organizations,
  selectedId,
  snapshot,
  admin,
  apiKeys,
}: {
  organizations: OrganizationSummary[]
  selectedId: string | null
  snapshot: PlatformSnapshot | null
  admin: AdminData | null
  apiKeys: ApiKeyRow[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [revealedKey, setRevealedKey] = useState<string | null>(null)
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)

  const run = (operation: () => Promise<void>) => startTransition(async () => {
    try { await operation() } catch (error) { toast.error(error instanceof Error ? error.message : 'Action failed') }
  })

  async function onCreateOrganization(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    run(async () => {
      const org = await createOrganization({ name: String(form.get('name') ?? ''), slug: String(form.get('slug') ?? '') })
      toast.success('Organization created')
      router.push(`/settings/platform?organization=${encodeURIComponent(org.id)}`)
      router.refresh()
    })
  }

  async function onAddStack(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedId) return
    const form = new FormData(event.currentTarget)
    run(async () => {
      await upsertStackComponent({
        organizationId: selectedId,
        name: String(form.get('name') ?? ''),
        technology: String(form.get('technology') ?? ''),
        kind: String(form.get('kind') ?? ''),
        version: String(form.get('version') ?? ''),
        environment: String(form.get('environment') ?? 'production'),
        criticality: Number(form.get('criticality') ?? 2),
      })
      toast.success('Stack component saved')
      router.refresh()
    })
  }

  async function onIntegration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedId) return
    const form = new FormData(event.currentTarget)
    run(async () => {
      await saveIntegration({
        organizationId: selectedId,
        provider: String(form.get('provider') ?? ''),
        displayName: String(form.get('displayName') ?? ''),
        externalAccountId: String(form.get('externalAccountId') ?? ''),
        config: { repository: String(form.get('repository') ?? '') || undefined },
      })
      toast.success('Integration saved')
      router.refresh()
    })
  }

  async function onCreateKey(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedId) return
    const form = new FormData(event.currentTarget)
    run(async () => {
      const key = await createMcpApiKey({ organizationId: selectedId, name: String(form.get('name') ?? 'MCP key') })
      setRevealedKey(key.key)
      toast.success('API key created — copy it now')
      router.refresh()
    })
  }

  async function onInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedId) return
    const form = new FormData(event.currentTarget)
    run(async () => {
      const invite = await createOrganizationInvitation({
        organizationId: selectedId,
        email: String(form.get('email') ?? ''),
        role: String(form.get('role') ?? 'member') as 'admin' | 'member' | 'viewer',
      })
      setInviteUrl(invite.inviteUrl)
      toast.success('Invitation created')
      router.refresh()
    })
  }

  async function onSecurity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedId) return
    const form = new FormData(event.currentTarget)
    run(async () => {
      await updateOrganizationSecurity({
        organizationId: selectedId,
        ssoDomain: String(form.get('ssoDomain') ?? ''),
        ssoProviderId: String(form.get('ssoProviderId') ?? ''),
        ssoEnforced: form.get('ssoEnforced') === 'on',
      })
      toast.success('SSO settings saved')
      router.refresh()
    })
  }

  async function openBilling(path: 'checkout' | 'portal', plan?: 'pro' | 'team') {
    if (!selectedId) return
    run(async () => {
      const response = await fetch(`/api/billing/${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: selectedId, ...(plan ? { plan } : {}) }),
      })
      const result = await response.json() as { url?: string; error?: string }
      if (!response.ok || !result.url) throw new Error(result.error ?? 'Billing request failed')
      window.location.assign(result.url)
    })
  }

  if (!organizations.length) {
    return (
      <section className="mx-auto max-w-xl rounded-3xl border border-white/[0.07] bg-[#090909] p-8">
        <Building2 className="h-5 w-5 text-electric-cyan" />
        <h2 className="mt-5 text-2xl font-medium text-white">Create your first organization</h2>
        <p className="mt-3 text-sm leading-6 text-zinc-500">Organizations provide the tenant boundary for stacks, intelligence, API keys, billing and team data.</p>
        <form onSubmit={onCreateOrganization} className="mt-7 space-y-3">
          <input name="name" required placeholder="Organization name" className="w-full rounded-xl border border-white/[0.07] bg-black/30 px-4 py-3 text-sm outline-none" />
          <input name="slug" required placeholder="organization-slug" pattern="[a-z0-9][a-z0-9-]{1,62}" className="w-full rounded-xl border border-white/[0.07] bg-black/30 px-4 py-3 text-sm outline-none" />
          <button disabled={pending} className="premium-button-primary w-full justify-center">Create organization</button>
        </form>
      </section>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-sm font-medium text-white">Active organization</p><p className="mt-1 text-xs text-zinc-600">Choose the tenant you are administering.</p></div>
        <div className="flex flex-wrap gap-2">{organizations.map((org) => <Link key={org.id} href={`/settings/platform?organization=${org.id}`} className={`rounded-lg px-3 py-2 text-xs ${org.id === selectedId ? 'bg-white text-black' : 'border border-white/[0.06] text-zinc-500'}`}>{org.name}</Link>)}</div>
      </div>

      {snapshot && <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[
        ['Plan', snapshot.organization.plan],
        ['Stack', snapshot.stack.length],
        ['Signals', snapshot.signals.length],
        ['Integrations', snapshot.integrations.length],
      ].map(([label, value]) => <div key={String(label)} className="rounded-2xl border border-white/[0.06] bg-[#090909] p-5"><p className="text-xl font-semibold capitalize text-white">{String(value)}</p><p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-zinc-700">{String(label)}</p></div>)}</div>}

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel icon={Network} title="Stack inventory" description="Persist components that should receive release and vulnerability impact matching.">
          <form onSubmit={onAddStack} className="grid gap-2 sm:grid-cols-2">
            <Field name="name" placeholder="Component name" />
            <Field name="technology" placeholder="Kubernetes / Cilium / AWS" />
            <Field name="kind" placeholder="Runtime / Networking / Cloud" />
            <Field name="version" placeholder="Version (optional)" />
            <Field name="environment" placeholder="production" defaultValue="production" />
            <select name="criticality" defaultValue="3" className="rounded-xl border border-white/[0.07] bg-black/30 px-3 py-2.5 text-sm text-zinc-400"><option value="1">Criticality 1</option><option value="2">Criticality 2</option><option value="3">Criticality 3</option><option value="4">Criticality 4</option><option value="5">Criticality 5</option></select>
            <button disabled={pending} className="premium-button-secondary sm:col-span-2">Save component</button>
          </form>
          {snapshot?.stack.length ? <div className="mt-4 flex flex-wrap gap-2">{snapshot.stack.slice(0, 12).map((item) => <span key={item.id} className="rounded-lg border border-white/[0.05] px-2.5 py-1 text-xs text-zinc-500">{item.name} · {item.technology}</span>)}</div> : null}
        </Panel>

        <Panel icon={CloudCog} title="Integrations" description="Register GitHub, Kubernetes, Terraform, Backstage, observability and incident-management connections. Secrets stay in your secret manager; RapidReach stores only credential references.">
          <form onSubmit={onIntegration} className="grid gap-2 sm:grid-cols-2">
            <Field name="provider" placeholder="github / kubernetes / grafana" />
            <Field name="displayName" placeholder="Production cluster" />
            <Field name="externalAccountId" placeholder="External account ID" />
            <Field name="repository" placeholder="Repository / source hint" />
            <button disabled={pending} className="premium-button-secondary sm:col-span-2">Save integration</button>
          </form>
          <div className="mt-4 space-y-2">{snapshot?.integrations.map((item) => <div key={item.id} className="flex items-center justify-between rounded-xl border border-white/[0.05] px-3 py-2 text-xs"><span className="text-zinc-400">{item.displayName} · {item.provider}</span><span className="text-zinc-600">{item.status}</span></div>)}</div>
        </Panel>

        <Panel icon={KeyRound} title="MCP & API keys" description="Remote MCP is authenticated by default. Keys are hashed at rest and the plaintext is shown only once.">
          <form onSubmit={onCreateKey} className="flex gap-2"><Field name="name" placeholder="Cursor / CI agent" /><button disabled={pending} className="premium-button-secondary shrink-0">Create key</button></form>
          {revealedKey && <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/[0.05] p-4"><p className="text-[10px] uppercase tracking-wider text-amber-300">Copy now — it will not be shown again</p><code className="mt-2 block break-all text-xs text-zinc-300">{revealedKey}</code></div>}
          <div className="mt-4 space-y-2">{apiKeys.map((key) => <div key={key.id} className="flex items-center justify-between rounded-xl border border-white/[0.05] px-3 py-2 text-xs"><span className="text-zinc-400">{key.name} · {key.key_prefix}…</span><span className={key.revoked_at ? 'text-red-400' : 'text-zinc-600'}>{key.revoked_at ? 'revoked' : key.last_used_at ? 'used' : 'unused'}</span></div>)}</div>
        </Panel>

        <Panel icon={UserPlus} title="Team access" description="Create expiring, single-email organization invitations instead of manually provisioning shared accounts.">
          <form onSubmit={onInvite} className="grid gap-2 sm:grid-cols-[1fr_auto_auto]"><Field name="email" type="email" placeholder="engineer@company.com" /><select name="role" defaultValue="member" className="rounded-xl border border-white/[0.07] bg-black/30 px-3 py-2.5 text-sm text-zinc-400"><option value="member">Member</option><option value="viewer">Viewer</option><option value="admin">Admin</option></select><button disabled={pending} className="premium-button-secondary">Invite</button></form>
          {inviteUrl && <div className="mt-4 rounded-xl border border-white/[0.06] bg-black/20 p-3"><p className="text-[10px] text-zinc-600">Share this invitation URL securely:</p><code className="mt-2 block break-all text-xs text-zinc-400">{inviteUrl}</code></div>}
          <div className="mt-4 space-y-2">{admin?.members.map((member) => { const profile = Array.isArray(member.user_profiles) ? member.user_profiles[0] : member.user_profiles; return <div key={member.user_id} className="flex items-center justify-between rounded-xl border border-white/[0.05] px-3 py-2 text-xs"><span className="text-zinc-400">{profile?.full_name ?? profile?.email ?? member.user_id}</span><span className="text-zinc-600">{member.role}</span></div> })}</div>
        </Panel>

        <Panel icon={ShieldCheck} title="Enterprise SSO" description="Store the organization SSO routing configuration here; the identity provider itself is configured in Supabase Auth.">
          <form onSubmit={onSecurity} className="space-y-2"><Field name="ssoDomain" placeholder="company.com" defaultValue={admin?.organization.sso_domain ?? ''} /><Field name="ssoProviderId" placeholder="Supabase SSO provider ID" defaultValue={admin?.organization.sso_provider_id ?? ''} /><label className="flex items-center gap-2 rounded-xl border border-white/[0.05] px-3 py-3 text-xs text-zinc-500"><input type="checkbox" name="ssoEnforced" defaultChecked={admin?.organization.sso_enforced ?? false} /> Require SSO for organization access</label><button disabled={pending} className="premium-button-secondary w-full">Save SSO policy</button></form>
          {admin?.organization.sso_domain && <Link href={`/auth/sso?domain=${encodeURIComponent(admin.organization.sso_domain)}`} className="mt-3 inline-block text-xs text-electric-cyan">Test SSO sign-in →</Link>}
        </Panel>

        <Panel icon={CreditCard} title="Billing & usage" description="Stripe Checkout and the customer portal synchronize plan state through signed, idempotent webhooks.">
          <p className="text-sm text-zinc-400">Current plan: <span className="font-medium capitalize text-white">{snapshot?.organization.plan ?? 'free'}</span> · {snapshot?.organization.billingStatus ?? 'inactive'}</p>
          <div className="mt-4 flex flex-wrap gap-2"><button onClick={() => openBilling('checkout', 'pro')} disabled={pending} className="premium-button-secondary">Upgrade to Pro</button><button onClick={() => openBilling('checkout', 'team')} disabled={pending} className="premium-button-secondary">Upgrade to Team</button>{admin?.organization.billing_customer_id && <button onClick={() => openBilling('portal')} disabled={pending} className="premium-button-secondary">Billing portal</button>}</div>
          {snapshot?.usage.length ? <div className="mt-4 space-y-2">{snapshot.usage.map((meter) => <div key={meter.meter} className="flex justify-between rounded-xl border border-white/[0.05] px-3 py-2 text-xs"><span className="text-zinc-500">{meter.meter}</span><span className="text-zinc-300">{meter.quantity.toLocaleString()}</span></div>)}</div> : <p className="mt-4 text-xs text-zinc-700">No metered usage this month.</p>}
        </Panel>
      </div>
    </div>
  )
}

function Panel({ icon: Icon, title, description, children }: { icon: typeof Network; title: string; description: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-white/[0.06] bg-[#090909] p-6"><div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.03]"><Icon className="h-4 w-4 text-electric-cyan" /></span><div><h2 className="text-sm font-medium text-white">{title}</h2><p className="mt-1 text-xs leading-5 text-zinc-600">{description}</p></div></div><div className="mt-5">{children}</div></section>
}

function Field({ name, placeholder, type = 'text', defaultValue }: { name: string; placeholder: string; type?: string; defaultValue?: string }) {
  return <input name={name} type={type} placeholder={placeholder} defaultValue={defaultValue} required={name !== 'version' && name !== 'externalAccountId' && name !== 'repository' && name !== 'ssoProviderId'} className="min-w-0 w-full rounded-xl border border-white/[0.07] bg-black/30 px-3 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-700 outline-none focus:border-electric-cyan/30" />
}
