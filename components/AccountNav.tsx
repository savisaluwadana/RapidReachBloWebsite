"use client";

import Link from "next/link";
import { Fragment, useEffect, useState } from "react";

type Me = { role: "user" | "admin" } | null;

export function AccountNav({ mobile = false }: { mobile?: boolean }) {
  const [me, setMe] = useState<Me>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/me", { credentials: "same-origin", cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled) setMe(data?.user || null);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (me) {
    const href = me.role === "admin" ? "/admin" : "/dashboard";
    const label = me.role === "admin" ? "Admin" : "Dashboard";

    if (mobile) return <Link href={href}>{label}</Link>;

    return (
      <Link href={href} className="nav-pill" aria-live="polite">
        {label} <span aria-hidden="true">↗</span>
      </Link>
    );
  }

  if (mobile) {
    return (
      <Fragment>
        <Link href="/login">Log in</Link>
        <Link href="/register">Register</Link>
      </Fragment>
    );
  }

  return (
    <div className="nav-auth-links" aria-live="polite" aria-busy={!loaded}>
      <Link href="/login" className="nav-login-link">Log in</Link>
      <Link href="/register" className="nav-pill nav-register-pill">
        Create account <span aria-hidden="true">↗</span>
      </Link>
    </div>
  );
}
