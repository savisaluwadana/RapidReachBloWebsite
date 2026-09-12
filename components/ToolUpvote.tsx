"use client";

import { useEffect, useState } from "react";

type VoteState = { slug: string; upvotes: number; voted: boolean };

export function ToolUpvote({ slug, initialUpvotes, large = false }: { slug: string; initialUpvotes: number; large?: boolean }) {
  const [state, setState] = useState<VoteState | null>(null);
  const [voting, setVoting] = useState(false);
  const known = state?.slug === slug;
  const upvotes = known ? state.upvotes : initialUpvotes;
  const voted = known ? state.voted : false;

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/tools/${encodeURIComponent(slug)}/upvote`, { cache: "no-store" })
      .then(async (response) => response.ok ? response.json() : null)
      .then((data) => {
        if (cancelled) return;
        setState({
          slug,
          upvotes: Number(data?.upvotes ?? initialUpvotes),
          voted: Boolean(data?.reacted),
        });
      })
      .catch(() => {
        if (!cancelled) setState({ slug, upvotes: initialUpvotes, voted: false });
      });
    return () => {
      cancelled = true;
    };
  }, [slug, initialUpvotes]);

  async function vote() {
    if (!known || voted || voting) return;
    setVoting(true);
    try {
      const response = await fetch(`/api/tools/${encodeURIComponent(slug)}/upvote`, { method: "POST" });
      if (!response.ok) return;
      const data = await response.json();
      setState({ slug, upvotes: Number(data.upvotes ?? upvotes), voted: Boolean(data.reacted) });
    } finally {
      setVoting(false);
    }
  }

  return <button type="button" onClick={vote} disabled={!known || voting || voted} className={`tool-vote${large ? " large" : ""}${voted ? " voted" : ""}`} aria-label={`Upvote ${slug}`} aria-pressed={voted}><span>▲</span><strong>{upvotes}</strong></button>;
}
