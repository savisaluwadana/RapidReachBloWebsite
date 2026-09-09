import Link from "next/link";
import { deletePost } from "@/app/admin/actions";
import { getAdminPosts } from "@/lib/posts";

export default async function PostsAdmin() {
  const posts = await getAdminPosts();
  return (
    <section className="cms-page">
      <header className="cms-page-head"><div><span className="section-kicker">Editorial</span><h1>Posts</h1><p>Create, edit, draft, publish, and remove developer-news articles.</p></div><Link className="cms-primary" href="/admin/posts/new">New post</Link></header>
      <div className="cms-table">
        <div className="cms-table-head"><span>Story</span><span>Category</span><span>Status</span><span>Updated</span><span></span></div>
        {posts.map((post) => <div className="cms-table-row" key={post.slug}><div><strong>{post.title}</strong><small>/{post.slug}</small></div><span>{post.category}</span><span className={`cms-status ${post.status}`}>{post.status}</span><span>{new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(post.updatedAt || post.publishedAt))}</span><div className="cms-row-actions"><Link href={`/admin/posts/${post.slug}/edit`}>Edit</Link>{post.status === "published" && <Link href={`/news/${post.slug}`} target="_blank">View ↗</Link>}<form action={deletePost}><input type="hidden" name="slug" value={post.slug}/><button className="cms-danger" type="submit">Delete</button></form></div></div>)}
      </div>
    </section>
  );
}
