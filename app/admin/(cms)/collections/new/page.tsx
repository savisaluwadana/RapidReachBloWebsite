import { CollectionForm } from "@/components/admin/CollectionForm";
import { getTools } from "@/lib/tools";
import { getAdminPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";

export default async function NewCollectionPage() {
  const [tools, posts] = await Promise.all([
    getTools({ includeDrafts: true }),
    getAdminPosts(),
  ]);

  return <><header className="cms-page-head"><div><span className="cms-kicker">Collections</span><h1>New collection</h1></div></header><CollectionForm tools={tools} posts={posts}/></>;
}
