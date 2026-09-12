"use client";

import { FormEvent, useEffect, useState } from "react";

type ClientComment = {
  _id?: string;
  name: string;
  body: string;
  createdAt: string;
  editedAt?: string;
  editable?: boolean;
};

function formatCommentDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date);
}

function tokenKey(id: string) {
  return `rapidreach:comment-edit-token:${id}`;
}

function commentToken(id?: string) {
  if (!id || typeof window === "undefined") return "";
  return window.localStorage.getItem(tokenKey(id)) || "";
}

export function Engagement({ slug, title, initialLikes }: { slug: string; title: string; initialLikes: number }) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [liking, setLiking] = useState(false);
  const [comments, setComments] = useState<ClientComment[]>([]);
  const [loadedSlug, setLoadedSlug] = useState<string | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [busyCommentId, setBusyCommentId] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingBody, setEditingBody] = useState("");
  const [message, setMessage] = useState("");
  const loading = loadedSlug !== slug;

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/comments?slug=${encodeURIComponent(slug)}`)
      .then((response) => response.ok ? response.json() : { comments: [] })
      .then((data) => {
        if (cancelled) return;
        const nextComments = (Array.isArray(data.comments) ? data.comments : []).map((comment: ClientComment) => ({
          ...comment,
          editable: Boolean(comment._id && commentToken(comment._id)),
        }));
        setComments(nextComments);
      })
      .catch(() => {
        if (!cancelled) setComments([]);
      })
      .finally(() => {
        if (!cancelled) setLoadedSlug(slug);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  async function like() {
    if (liked || liking) return;
    setLiking(true);
    try {
      const response = await fetch(`/api/posts/${encodeURIComponent(slug)}/like`, { method: "POST" });
      if (!response.ok) return;
      const data = await response.json();
      setLikes((current) => Number(data.likes ?? current));
      setLiked(true);
    } finally {
      setLiking(false);
    }
  }

  async function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingComment) return;

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setMessage("");
    setSubmittingComment(true);

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, name: form.get("name"), body: form.get("body") }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(typeof data.error === "string" ? data.error : "Could not publish that comment.");
        return;
      }

      const created = data.comment as ClientComment;
      if (created?._id && typeof data.editToken === "string") {
        window.localStorage.setItem(tokenKey(created._id), data.editToken);
        created.editable = true;
      }
      setComments((current) => [created, ...current]);
      formElement.reset();
      setMessage("Comment published. You can edit or delete it from this browser.");
    } catch {
      setMessage("Could not publish that comment. Check your connection and try again.");
    } finally {
      setSubmittingComment(false);
    }
  }

  function beginEdit(comment: ClientComment) {
    if (!comment._id || !comment.editable) return;
    setMessage("");
    setEditingCommentId(comment._id);
    setEditingBody(comment.body);
  }

  async function saveCommentEdit(id: string) {
    const token = commentToken(id);
    const body = editingBody.trim();
    if (!token || body.length < 2 || busyCommentId) return;
    setBusyCommentId(id);
    setMessage("");
    try {
      const response = await fetch("/api/comments", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, slug, token, body }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(typeof data.error === "string" ? data.error : "Could not edit that comment.");
        return;
      }
      setComments((current) => current.map((comment) => comment._id === id
        ? { ...comment, body: String(data.comment?.body || body), editedAt: String(data.comment?.editedAt || new Date().toISOString()) }
        : comment));
      setEditingCommentId(null);
      setEditingBody("");
      setMessage("Comment updated.");
    } catch {
      setMessage("Could not edit that comment. Check your connection and try again.");
    } finally {
      setBusyCommentId(null);
    }
  }

  async function deleteComment(id: string) {
    const token = commentToken(id);
    if (!token || busyCommentId || !window.confirm("Delete this comment permanently?")) return;
    setBusyCommentId(id);
    setMessage("");
    try {
      const response = await fetch("/api/comments", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, slug, token }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(typeof data.error === "string" ? data.error : "Could not delete that comment.");
        return;
      }
      window.localStorage.removeItem(tokenKey(id));
      setComments((current) => current.filter((comment) => comment._id !== id));
      if (editingCommentId === id) {
        setEditingCommentId(null);
        setEditingBody("");
      }
      setMessage("Comment deleted.");
    } catch {
      setMessage("Could not delete that comment. Check your connection and try again.");
    } finally {
      setBusyCommentId(null);
    }
  }

  function share(network: string) {
    const url = window.location.href;
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const targets: Record<string, string> = {
      x: `https://x.com/intent/post?text=${encodedTitle}&url=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      reddit: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
      hn: `https://news.ycombinator.com/submitlink?u=${encodedUrl}&t=${encodedTitle}`,
    };
    const target = targets[network];
    if (target) window.open(target, "_blank", "noopener,noreferrer,width=720,height=640");
  }

  async function nativeShare() {
    try {
      if (navigator.share) {
        await navigator.share({ title, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setMessage("Link copied.");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setMessage("Could not share this page.");
    }
  }

  return (
    <section className="engagement" aria-label="Article discussion and sharing">
      <div className="engagement-toolbar">
        <div className="engagement-copy">
          <span className="section-kicker">Pass it on</span>
          <p>If this was useful, save the signal or send it to someone building the same thing.</p>
        </div>
        <div className="engagement-actions">
          <button className={liked ? "action-button active" : "action-button"} onClick={like} aria-pressed={liked} disabled={liking}>♥ {likes}</button>
          <button className="action-button" onClick={nativeShare}>Share ↗</button>
          <button className="action-button ghost" onClick={() => share("x")}>X</button>
          <button className="action-button ghost" onClick={() => share("linkedin")}>LinkedIn</button>
          <button className="action-button ghost" onClick={() => share("reddit")}>Reddit</button>
          <button className="action-button ghost" onClick={() => share("hn")}>Hacker News</button>
        </div>
      </div>

      <div className="discussion">
        <div className="discussion-heading">
          <div><span className="section-kicker">Discussion</span><h2>{comments.length} comment{comments.length === 1 ? "" : "s"}</h2></div>
          <p>Add context, corrections, or a useful counterpoint.</p>
        </div>

        <form className="comment-form" onSubmit={submitComment}>
          <label>Name<input name="name" required maxLength={60} placeholder="Your name" /></label>
          <label>Comment<textarea name="body" required minLength={2} maxLength={1200} rows={4} placeholder="What should other builders know?" /></label>
          <button className="primary-button" type="submit" disabled={submittingComment}>{submittingComment ? "Publishing…" : "Publish comment ↗"}</button>
          {message && <span className="form-message" role="status">{message}</span>}
        </form>

        <div className="comments">
          {loading ? <p className="muted">Loading discussion…</p> : comments.length === 0 ? <p className="muted empty-discussion">No comments yet. Start the useful part of the internet.</p> : comments.map((comment, index) => (
            <article className="comment" key={comment._id || `${comment.createdAt}-${index}`}>
              <div className="comment-meta"><span className="comment-avatar" aria-hidden="true">{comment.name.charAt(0).toUpperCase()}</span><strong>{comment.name}</strong><time dateTime={comment.createdAt}>{formatCommentDate(comment.createdAt)}</time>{comment.editedAt && <span>Edited</span>}</div>
              {editingCommentId === comment._id ? (
                <div className="comment-edit-form">
                  <textarea value={editingBody} onChange={(event) => setEditingBody(event.target.value)} minLength={2} maxLength={1200} rows={4} aria-label="Edit comment" />
                  <div className="comment-owner-actions">
                    <button className="action-button" type="button" disabled={busyCommentId === comment._id || editingBody.trim().length < 2} onClick={() => comment._id && saveCommentEdit(comment._id)}>{busyCommentId === comment._id ? "Saving…" : "Save"}</button>
                    <button className="action-button ghost" type="button" disabled={busyCommentId === comment._id} onClick={() => { setEditingCommentId(null); setEditingBody(""); }}>Cancel</button>
                  </div>
                </div>
              ) : <p>{comment.body}</p>}
              {comment.editable && editingCommentId !== comment._id && (
                <div className="comment-owner-actions">
                  <button className="action-button ghost" type="button" disabled={busyCommentId === comment._id} onClick={() => beginEdit(comment)}>Edit</button>
                  <button className="action-button ghost" type="button" disabled={busyCommentId === comment._id} onClick={() => comment._id && deleteComment(comment._id)}>{busyCommentId === comment._id ? "Deleting…" : "Delete"}</button>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
