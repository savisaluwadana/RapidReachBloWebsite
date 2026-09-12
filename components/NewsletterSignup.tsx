"use client";

import { FormEvent, useState } from "react";

export function NewsletterSignup({ compact = false }: { compact?: boolean }) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const email = String(form.get("email") || "").trim();
    setState("busy");
    setMessage("");

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setState("done");
        setMessage(data.alreadySubscribed ? "You’re already on the weekly briefing list." : "You’re on the list. One useful briefing a week.");
        formElement.reset();
      } else {
        setState("error");
        setMessage(data.error || "Could not subscribe right now.");
      }
    } catch {
      setState("error");
      setMessage("Could not subscribe right now. Check your connection and try again.");
    }
  }

  return <form className={`newsletter-form ${compact ? "compact" : ""}`} onSubmit={submit}><label><span>Email address</span><input type="email" name="email" required placeholder="you@company.com" autoComplete="email" /></label><button type="submit" disabled={state === "busy"}>{state === "busy" ? "Joining…" : "Join the briefing ↗"}</button>{message && <p role="status" className={state === "error" ? "newsletter-error" : "newsletter-success"}>{message}</p>}</form>;
}
