import Link from "next/link";
import { moderateComment } from "@/app/admin/comment-actions";
import { getDb } from "@/lib/mongodb";

export default async function CommentsAdmin() {
  const db = await getDb();
  const comments = await db.collection("comments")
    .find({})
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();

  return (
    <section className="cms-page">
      <header className="cms-page-head"><div><span className="section-kicker">Community moderation</span><h1>Comments</h1><p>Review the latest article discussion, hide abuse or spam, restore comments, or permanently delete them.</p></div></header>
      <div className="cms-table">
        <div className="cms-table-head"><span>Comment</span><span>Article</span><span>Status</span><span>Date</span><span></span></div>
        {comments.map((comment) => {
          const id = String(comment._id);
          const slug = String(comment.postSlug || "");
          const status = comment.status === "hidden" ? "hidden" : "visible";
          return (
            <div className="cms-table-row" key={id}>
              <div><strong>{String(comment.name || "Anonymous")}</strong><small>{String(comment.body || "")}</small></div>
              <span>{slug ? <Link href={`/news/${slug}`} target="_blank">{slug} ↗</Link> : "—"}</span>
              <span className={`cms-status ${status === "visible" ? "published" : "draft"}`}>{status}</span>
              <span>{String(comment.createdAt || "").slice(0, 10) || "—"}</span>
              <div className="cms-row-actions">
                <form action={moderateComment}><input type="hidden" name="id" value={id} /><button className="cms-secondary" type="submit" name="action" value={status === "hidden" ? "show" : "hide"}>{status === "hidden" ? "Restore" : "Hide"}</button></form>
                <form action={moderateComment}><input type="hidden" name="id" value={id} /><button className="cms-danger" type="submit" name="action" value="delete">Delete</button></form>
              </div>
            </div>
          );
        })}
        {!comments.length && <div className="cms-empty">No comments have been submitted yet.</div>}
      </div>
    </section>
  );
}
