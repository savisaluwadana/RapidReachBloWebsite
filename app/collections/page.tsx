import type { Metadata } from "next";
import Link from "next/link";
import { getCollections } from "@/lib/collections";

const description = "Editorially curated developer stacks and reading lists from RapidReach.";

export const metadata: Metadata = {
  title: "Developer Tool Collections",
  description,
  alternates: { canonical: "/collections" },
  openGraph: { title: "Developer Tool Collections | RapidReach", description, url: "/collections", type: "website" },
  twitter: { card: "summary_large_image", title: "Developer Tool Collections | RapidReach", description },
};
export const revalidate = 60;

export default async function CollectionsPage() {
  const collections = await getCollections();
  return <main className="collections-page shell"><header className="collection-hero"><span className="section-kicker">RapidReach collections</span><h1>Curated stacks for real engineering decisions.</h1><p>Tools and reporting grouped around a job to be done, not an affiliate list.</p></header><div className="collection-grid">{collections.map((item) => <Link className="collection-card" href={`/collections/${item.slug}`} key={item.slug}><span>{item.featured ? "Editor’s collection" : "Collection"}</span><h2>{item.title}</h2><p>{item.description}</p><footer><span>{item.toolSlugs.length} tools · {item.postSlugs.length} stories</span><strong>Explore ↗</strong></footer></Link>)}</div></main>;
}
