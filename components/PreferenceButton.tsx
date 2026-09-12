"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Kind = "tool" | "post" | "topic";

export function PreferenceButton({ kind, value, label, savedLabel, className = "account-secondary" }: { kind: Kind; value: string; label: string; savedLabel: string; className?: string }) {
  const [saved, setSaved] = useState(false);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/me/preferences", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) { setSignedIn(false); return; }
        const data = await response.json();
        setSignedIn(true);
        const prefs = data.preferences || {};
        const values = kind === "tool" ? prefs.savedTools : kind === "post" ? prefs.savedPosts : prefs.followedTopics;
        setSaved(Array.isArray(values) && values.includes(value));
      })
      .catch(() => setSignedIn(false));
  }, [kind, value]);

  async function toggle() {
    if (signedIn === false) {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setBusy(true);
    try {
      const response = await fetch("/api/me/preferences", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind, value }),
      });
      if (response.status === 401) {
        router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
        return;
      }
      if (response.ok) {
        const data = await response.json();
        setSaved(Boolean(data.saved));
      }
    } catch {
      // Keep the previous state and re-enable the control so the user can retry.
    } finally {
      setBusy(false);
    }
  }

  return <button type="button" className={className} onClick={toggle} disabled={busy} aria-pressed={saved}>{busy ? "Saving…" : saved ? savedLabel : label}</button>;
}
