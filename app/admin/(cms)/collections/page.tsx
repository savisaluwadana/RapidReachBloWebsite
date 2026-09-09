import Link from "next/link";
import { getCollections } from "@/lib/collections";
import { deleteCollection } from "@/app/admin/intelligence-actions";

export const dynamic = "force-dynamic";

export default async function AdminCollectionsPage() {
  const collections = await getCollections(true);
  return <><header className="cms-page-head"><div><span className="cms-kicker">Editorial intelligence</span><h1>Collections</h1><p>Build curated stacks that combine tools and RapidReach reporting around a concrete engineering decision.</p></div><Link className="cms-primary" href="/admin/collections/new">New collection</Link></header><div className="cms-table"><div className="cms-table-head"><span>Collection</span><span>Status</span><span>Contents</span><span>Actions</span></div>{collections.map((item) => <div className="cms-table-row" key={item.slug}><div><strong>{item.title}</strong><small>{item.description}</small></div><span>{item.status}{item.featured ? " · featured" : ""}</span><span>{item.toolSlugs.length} tools · {item.postSlugs.length} stories</span><div className="cms-row-actions"><Link href={`/admin/collections/${item.slug}/edit`}>Edit</Link><form action={deleteCollection}><input type="hidden" name="slug" value={item.slug}/><button className="cms-danger" type="submit">Delete</button></form></div></div>)}</div></>;
}
