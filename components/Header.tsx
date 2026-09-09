import Link from "next/link";
import { AccountNav } from "@/components/AccountNav";

export function Header() {
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
          <AccountNav />
        </div>
      </div>
      <nav className="mobile-nav shell" aria-label="Mobile navigation">
        <Link href="/#latest">News</Link><Link href="/tools">Tools</Link><Link href="/#topics">Topics</Link><Link href="/search">Search</Link><AccountNav mobile />
      </nav>
    </header>
  );
}
