"use client";

import { useState } from "react";

export function ToolUpvote({ slug, initialUpvotes, large = false }: { slug: string; initialUpvotes: number; large?: boolean }) {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [voted, setVoted] = useState(false);
  const [voting, setVoting] = useState(false);

  async function vote() {
    if (voted || voting) return;
    setVoting(true);
    try {
      const response = await fetch(`/api/tools/${encodeURIComponent(slug)}/upvote`, { method: "POST" });
      if (!response.ok) return;
      const data = await response.json();
      setUpvotes(Number(data.upvotes ?? upvotes));
      setVoted(true);
    } finally {
      setVoting(false);
    }
  }

  return <button type="button" onClick={vote} disabled={voting} className={`tool-vote${large ? " large" : ""}${voted ? " voted" : ""}`} aria-label={`Upvote ${slug}`} aria-pressed={voted}><span>▲</span><strong>{upvotes}</strong></button>;
}
