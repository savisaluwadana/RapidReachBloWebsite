import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { acceptOrganizationInvitation } from '@/lib/actions/organization'

export default async function InvitationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  return (
    <main className="min-h-screen bg-deep-charcoal text-white">
      <Navbar />
      <section className="container mx-auto px-6 py-24">
        <div className="mx-auto max-w-xl rounded-3xl border border-white/[0.07] bg-[#090909] p-8 md:p-10">
          <p className="premium-section-label">RapidReach Teams</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.035em]">Join an engineering organization.</h1>
          <p className="mt-4 text-sm leading-6 text-zinc-500">Sign in with the email address that received this invitation, then accept it to join the organization. Invitation tokens are stored hashed and expire after seven days.</p>
          <form action={async () => {
            'use server'
            const result = await acceptOrganizationInvitation(token)
            redirect(`/teams?organization=${encodeURIComponent(result.organizationId)}`)
          }} className="mt-8">
            <button type="submit" className="premium-button-primary w-full justify-center">Accept invitation</button>
          </form>
        </div>
      </section>
      <Footer />
    </main>
  )
}
