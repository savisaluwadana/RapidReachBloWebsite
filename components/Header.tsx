import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export async function Header() {
  const user = await getCurrentUser();
  return (
    <header className="site-header">
      <div className="shell nav-shell">
        <Link href="/" className="brand" aria-label="RapidReach home">
          <span className="brand-mark" aria-hidden="true">R</span>
          <span className="brand-lockup"><strong>RapidReach</strong><small>Developer briefing</small></span>
        </Link>
        <nav className="main-nav" aria-label="Primary navigation">
          <Link href="/#latest">News</Link>
          <Link className="nav-tools-link" href="/tools">Tools <span>New</span></Link>
          <Link href="/#topics">Topics</Link>
          <Link className="nav-search" href="/search" aria-label="Search RapidReach">Search <span aria-hidden="true">⌕</span></Link>
        </nav>
        <div className="nav-account-wrap">
          <Link href="/feed.xml" className="nav-rss">RSS</Link>
          {user ? <Link href={user.role === "admin" ? "/admin" : "/dashboard"} className="nav-pill">{user.role === "admin" ? "Admin" : "Dashboard"} <span aria-hidden="true">↗</span></Link> : <Link href="/login" className="nav-pill">Sign in <span aria-hidden="true">↗</span></Link>}
        </div>
      </div>
      <nav className="mobile-nav shell" aria-label="Mobile navigation">
        <Link href="/#latest">News</Link><Link href="/tools">Tools</Link><Link href="/#topics">Topics</Link><Link href="/search">Search</Link><Link href={user ? "/dashboard" : "/login"}>{user ? "Dashboard" : "Sign in"}</Link>
      </nav>
    </header>
  );
}
