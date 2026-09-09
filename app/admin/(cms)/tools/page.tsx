import Link from "next/link";
import { deleteTool } from "@/app/admin/actions";
import { getTools } from "@/lib/tools";

export default async function ToolsAdmin() {
  const tools = await getTools({ includeDrafts: true });
  return (
    <section className="cms-page">
      <header className="cms-page-head"><div><span className="section-kicker">Discovery</span><h1>Developer tools</h1><p>Curate Product Hunt-style listings without turning RapidReach into a marketplace backend.</p></div><Link className="cms-primary" href="/admin/tools/new">Add tool</Link></header>
      <div className="cms-table">
        <div className="cms-table-head"><span>Tool</span><span>Category</span><span>Status</span><span>Upvotes</span><span></span></div>
        {tools.map((tool) => <div className="cms-table-row" key={tool.slug}><div><strong>{tool.name}</strong><small>{tool.tagline}</small></div><span>{tool.category}</span><span className={`cms-status ${tool.status}`}>{tool.status}</span><span>{tool.upvotes}</span><div className="cms-row-actions"><Link href={`/admin/tools/${tool.slug}/edit`}>Edit</Link>{tool.status === "published" && <Link href={`/tools/${tool.slug}`} target="_blank">View ↗</Link>}<form action={deleteTool}><input type="hidden" name="slug" value={tool.slug}/><button className="cms-danger" type="submit">Delete</button></form></div></div>)}
      </div>
    </section>
  );
}
