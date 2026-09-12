"use client";

import { FormEvent, useEffect, useState } from "react";

type ClientComment = { _id?: string; name: string; body: string; createdAt: string };

function formatCommentDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date);
}

export function Engagement({ slug, title, initialLikes }: { slug: string; title: string; initialLikes: number }) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [liking, setLiking] = useState(false);
  const [comments, setComments] = useState<ClientComment[]>([]);
  const [loadedSlug, setLoadedSlug] = useState<string | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [message, setMessage] = useState("");
  const loading = loadedSlug !== slug;

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/comments?slug=${encodeURIComponent(slug)}`)
      .then((response) => response.ok ? response.json() : { comments: [] })
      .then((data) => {
        if (!cancelled) setComments(data.comments || []);
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

      setComments((current) => [data.comment, ...current]);
      formElement.reset();
      setMessage("Comment published.");
    } finally {
      setSubmittingComment(false);
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
              <div className="comment-meta"><span className="comment-avatar" aria-hidden="true">{comment.name.charAt(0).toUpperCase()}</span><strong>{comment.name}</strong><time dateTime={comment.createdAt}>{formatCommentDate(comment.createdAt)}</time></div>
              <p>{comment.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
