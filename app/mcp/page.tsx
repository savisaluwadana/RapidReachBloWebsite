import { Bot, Braces, Network, ShieldCheck } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { mcpTools } from '@/lib/rapidreach/product-data'

export default function MCPPage() {
  return (
    <main className="min-h-screen bg-deep-charcoal text-white">
      <Navbar />
      <section className="border-b border-white/[0.05] bg-[radial-gradient(circle_at_70%_0%,rgba(0,255,136,.06),transparent_32%)]"><div className="container mx-auto px-6 py-20 md:py-24"><div className="mx-auto max-w-6xl"><p className="premium-section-label">RapidReach MCP</p><h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.045em] md:text-6xl">Give engineering agents the same context your best operators have.</h1><p className="mt-6 max-w-2xl text-base leading-7 text-zinc-500">The MCP service exposes RapidReach knowledge, stack context, incident reasoning, release impact, and learning recommendations to IDEs and AI agents through a first-class protocol surface.</p><div className="mt-8 inline-flex rounded-xl border border-white/[0.07] bg-black/35 px-4 py-3 font-mono text-xs text-zinc-400">https://mcp.rapidreach.blog/mcp <span className="ml-3 text-zinc-700">planned deployment</span></div></div></div></section>
      <section className="py-16"><div className="container mx-auto px-6"><div className="mx-auto max-w-6xl">
        <div className="grid gap-3 md:grid-cols-3">{[
          [Bot, 'Agent interface', 'Designed for IDEs, assistants, and infrastructure agents—not only the website.'],
          [Network, 'Context-aware tools', 'Tools can reason about technology relationships, stack impact, and skill dependencies.'],
          [ShieldCheck, 'Enterprise boundary', 'The service is structured so organization-scoped data and authorization can be layered in without exposing private context publicly.'],
        ].map(([Icon, title, body]) => { const I = Icon as typeof Bot; return <div key={String(title)} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"><I className="h-4 w-4 text-electric-cyan" /><h2 className="mt-5 text-sm font-medium text-white">{String(title)}</h2><p className="mt-2 text-xs leading-5 text-zinc-600">{String(body)}</p></div> })}</div>
        <div className="mt-10 grid gap-5 lg:grid-cols-[.7fr_1.3fr]"><div><p className="premium-section-label">Tool catalog</p><h2 className="mt-4 text-3xl font-medium tracking-tight">Engineering intelligence as an API surface.</h2><p className="mt-4 text-sm leading-6 text-zinc-500">The repository now contains the executable Go MCP server. These tools are deterministic first versions; live graph/search adapters can replace the seed catalog without changing the external contract.</p></div><div className="rounded-2xl border border-white/[0.06] bg-[#090909] p-5">{mcpTools.map((tool) => <div key={tool} className="flex items-center gap-3 border-b border-white/[0.04] px-2 py-3 last:border-0"><Braces className="h-3.5 w-3.5 text-zinc-700" /><code className="text-xs text-zinc-300">{tool}</code></div>)}</div></div>
      </div></div></section>
      <Footer />
    </main>
  )
}
