"use client";

import { FormEvent, useEffect, useState } from "react";

type ClientComment = { _id?: string; name: string; body: string; createdAt: string };

export function Engagement({ slug, title, initialLikes }: { slug: string; title: string; initialLikes: number }) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState<ClientComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`/api/comments?slug=${encodeURIComponent(slug)}`).then((r) => r.ok ? r.json() : { comments: [] }).then((d) => setComments(d.comments || [])).finally(() => setLoading(false));
  }, [slug]);

  async function like() {
    if (liked) return;
    const res = await fetch(`/api/posts/${encodeURIComponent(slug)}/like`, { method: "POST" });
    if (res.ok) { const data = await res.json(); setLikes(data.likes); setLiked(true); }
  }

  async function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage("");
    const form = new FormData(event.currentTarget);
    const res = await fetch("/api/comments", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ slug, name: form.get("name"), body: form.get("body") }) });
    if (!res.ok) { setMessage("Could not publish that comment."); return; }
    const data = await res.json(); setComments((current) => [data.comment, ...current]); event.currentTarget.reset(); setMessage("Comment published.");
  }

  function share(network: string) {
    const url = window.location.href; const u = encodeURIComponent(url); const t = encodeURIComponent(title);
    const targets: Record<string, string> = { x: `https://x.com/intent/post?text=${t}&url=${u}`, linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, reddit: `https://www.reddit.com/submit?url=${u}&title=${t}`, hn: `https://news.ycombinator.com/submitlink?u=${u}&t=${t}` };
    window.open(targets[network], "_blank", "noopener,noreferrer,width=720,height=640");
  }

  async function nativeShare() {
    if (navigator.share) await navigator.share({ title, url: window.location.href });
    else { await navigator.clipboard.writeText(window.location.href); setMessage("Link copied."); }
  }

  return (
    <section className="engagement" aria-label="Article discussion and sharing">
      <div className="engagement-actions"><button className={liked ? "action-button active" : "action-button"} onClick={like}>♥ {likes}</button><button className="action-button" onClick={nativeShare}>Share</button><button className="action-button ghost" onClick={() => share("x")}>X</button><button className="action-button ghost" onClick={() => share("linkedin")}>LinkedIn</button><button className="action-button ghost" onClick={() => share("reddit")}>Reddit</button><button className="action-button ghost" onClick={() => share("hn")}>Hacker News</button></div>
      <div className="discussion"><div className="discussion-heading"><div><span className="section-kicker">Discussion</span><h2>{comments.length} comment{comments.length === 1 ? "" : "s"}</h2></div><p>Keep it useful, technical, and respectful.</p></div>
        <form className="comment-form" onSubmit={submitComment}><label>Name<input name="name" required maxLength={60} placeholder="Your name" /></label><label>Comment<textarea name="body" required minLength={2} maxLength={1200} rows={4} placeholder="Add context, a correction, or your take…" /></label><button className="primary-button" type="submit">Publish comment</button>{message && <span className="form-message" role="status">{message}</span>}</form>
        <div className="comments">{loading ? <p className="muted">Loading discussion…</p> : comments.length === 0 ? <p className="muted">No comments yet. Start the useful part of the internet.</p> : comments.map((comment, index) => <article className="comment" key={comment._id || `${comment.createdAt}-${index}`}><div><strong>{comment.name}</strong><time dateTime={comment.createdAt}>{new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(comment.createdAt))}</time></div><p>{comment.body}</p></article>)}</div>
      </div>
    </section>
  );
}
