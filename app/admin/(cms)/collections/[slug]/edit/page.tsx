import { notFound } from "next/navigation";
import { CollectionForm } from "@/components/admin/CollectionForm";
import { getCollectionBySlug } from "@/lib/collections";
import { getTools } from "@/lib/tools";
import { getPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";

export default async function EditCollectionPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const [collection, tools, posts] = await Promise.all([getCollectionBySlug(slug, true), getTools(), getPosts()]); if (!collection) notFound(); return <><header className="cms-page-head"><div><span className="cms-kicker">Collections</span><h1>Edit {collection.title}</h1></div></header><CollectionForm collection={collection} tools={tools} posts={posts}/></>; }
