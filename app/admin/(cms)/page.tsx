import Link from "next/link";
import { getCategoriesByKind } from "@/lib/categories";
import { getAdminPosts } from "@/lib/posts";
import { getTools } from "@/lib/tools";
import { hasDatabase } from "@/lib/mongodb";

export default async function AdminOverview() {
  const [posts, tools, postCategories, toolCategories] = await Promise.all([
    getAdminPosts(),
    getTools({ includeDrafts: true }),
    getCategoriesByKind("post"),
    getCategoriesByKind("tool"),
  ]);
  return (
    <section className="cms-page">
      <header className="cms-page-head"><div><span className="section-kicker">Editorial system</span><h1>Overview</h1><p>Publish news and maintain the developer-tool discovery layer from one small CMS.</p></div></header>
      {!hasDatabase() && <div className="cms-warning">MongoDB is not configured. Public starter content will render, but CMS writes require <code>MONGODB_URI</code>.</div>}
      <div className="cms-stat-grid">
        <Link href="/admin/posts"><strong>{posts.length}</strong><span>Posts</span><small>{posts.filter((post) => post.status === "draft").length} drafts</small></Link>
        <Link href="/admin/tools"><strong>{tools.length}</strong><span>Developer tools</span><small>{tools.filter((tool) => tool.status === "draft").length} drafts</small></Link>
        <Link href="/admin/categories"><strong>{postCategories.length}</strong><span>News categories</span><small>Managed taxonomy</small></Link>
        <Link href="/admin/categories"><strong>{toolCategories.length}</strong><span>Tool categories</span><small>Discovery taxonomy</small></Link>
      </div>
      <div className="cms-quick-grid">
        <Link href="/admin/posts/new"><span>New article</span><strong>Write developer news →</strong></Link>
        <Link href="/admin/tools/new"><span>New listing</span><strong>Add a developer tool →</strong></Link>
        <Link href="/admin/categories"><span>Taxonomy</span><strong>Manage categories →</strong></Link>
      </div>
    </section>
  );
}
