"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Me = { role: "user" | "admin" } | null;

export function AccountNav({ mobile = false }: { mobile?: boolean }) {
  const [me, setMe] = useState<Me>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/me", { credentials: "same-origin", cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (!cancelled) setMe(data?.user || null); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoaded(true); });
    return () => { cancelled = true; };
  }, []);

  const href = me?.role === "admin" ? "/admin" : me ? "/dashboard" : "/login";
  const label = me?.role === "admin" ? "Admin" : me ? "Dashboard" : "Sign in";

  if (mobile) return <Link href={href}>{label}</Link>;
  return <Link href={href} className="nav-pill" aria-live="polite">{loaded ? label : "Sign in"} <span aria-hidden="true">↗</span></Link>;
}
