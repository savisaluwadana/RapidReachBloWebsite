"use client";

import { useState } from "react";

export function ToolUpvote({ slug, initialUpvotes, large = false }: { slug: string; initialUpvotes: number; large?: boolean }) {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [voted, setVoted] = useState(false);

  async function vote() {
    if (voted) return;
    const response = await fetch(`/api/tools/${encodeURIComponent(slug)}/upvote`, { method: "POST" });
    if (!response.ok) return;
    const data = await response.json();
    setUpvotes(Number(data.upvotes || upvotes + 1));
    setVoted(true);
  }

  return <button type="button" onClick={vote} className={`tool-vote${large ? " large" : ""}${voted ? " voted" : ""}`} aria-label={`Upvote ${slug}`}><span>▲</span><strong>{upvotes}</strong></button>;
}
