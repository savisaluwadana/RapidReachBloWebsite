import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PlatformSettings from '@/components/PlatformSettings'
import { getPlatformOrganizations, getPlatformSnapshot, listMcpApiKeys } from '@/lib/actions/platform'
import { getOrganizationAdminData } from '@/lib/actions/organization'

export default async function PlatformSettingsPage({ searchParams }: { searchParams: Promise<{ organization?: string }> }) {
  const params = await searchParams
  let organizations = [] as Awaited<ReturnType<typeof getPlatformOrganizations>>
  try { organizations = await getPlatformOrganizations() } catch { organizations = [] }
  const selectedId = params.organization && organizations.some((org) => org.id === params.organization) ? params.organization : organizations[0]?.id

  let snapshot: Awaited<ReturnType<typeof getPlatformSnapshot>> | null = null
  let admin: Awaited<ReturnType<typeof getOrganizationAdminData>> | null = null
  let apiKeys: Awaited<ReturnType<typeof listMcpApiKeys>> = []
  if (selectedId) {
    try {
      const results = await Promise.all([
        getPlatformSnapshot(selectedId),
        getOrganizationAdminData(selectedId),
        listMcpApiKeys(selectedId),
      ])
      snapshot = results[0]
      admin = results[1]
      apiKeys = results[2]
    } catch {
      snapshot = null
      admin = null
      apiKeys = []
    }
  }

  return (
    <main className="min-h-screen bg-deep-charcoal text-white">
      <Navbar />
      <section className="border-b border-white/[0.05]"><div className="container mx-auto px-6 py-16"><div className="mx-auto max-w-6xl"><p className="premium-section-label">Platform administration</p><h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] md:text-5xl">Operate RapidReach as a real engineering system.</h1><p className="mt-5 max-w-2xl text-sm leading-6 text-zinc-500">Manage tenant data, stack inventory, integrations, SSO, team access, API keys, usage, and billing from one workspace.</p></div></div></section>
      <section className="py-12"><div className="container mx-auto px-6"><div className="mx-auto max-w-6xl"><PlatformSettings organizations={organizations} selectedId={selectedId ?? null} snapshot={snapshot} admin={admin} apiKeys={apiKeys} /></div></div></section>
      <Footer />
    </main>
  )
}
