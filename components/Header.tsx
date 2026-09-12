import Link from "next/link";
import { AccountNav } from "@/components/AccountNav";

export function Header() {
  return (
    <header className="site-header">
      <div className="shell nav-shell">
        <Link href="/" className="brand" aria-label="RapidReach home">
          <span className="brand-mark" aria-hidden="true">R</span>
          <span className="brand-lockup"><strong>RapidReach</strong><small>Developer intelligence</small></span>
        </Link>
        <nav className="main-nav" aria-label="Primary navigation">
          <Link href="/#signal-desk">Signal Desk</Link>
          <Link href="/briefing">Brief</Link>
          <Link className="nav-tools-link" href="/tools">Tools <span>New</span></Link>
          <Link href="/launches">Launch Radar</Link>
          <Link href="/about">About</Link>
          <Link className="nav-search" href="/search" aria-label="Search RapidReach">Search <span aria-hidden="true">⌕</span></Link>
        </nav>
        <div className="nav-account-wrap">
          <AccountNav />
        </div>
      </div>
      <nav className="mobile-nav shell" aria-label="Mobile navigation">
        <Link href="/#signal-desk">Signal Desk</Link><Link href="/briefing">Brief</Link><Link href="/tools">Tools</Link><Link href="/launches">Launch Radar</Link><Link href="/about">About</Link><Link href="/search">Search</Link><AccountNav mobile />
      </nav>
    </header>
  );
}
