import Link from "next/link";

export function Header() {
  return (
    <header className="site-header">
      <div className="shell nav-shell">
        <Link href="/" className="brand" aria-label="RapidReach home"><span className="brand-mark">R</span><span>RapidReach</span></Link>
        <nav className="main-nav" aria-label="Primary navigation">
          <Link href="/category/AI">AI</Link><Link href="/category/Cloud">Cloud</Link><Link href="/category/DevTools">DevTools</Link><Link href="/search">Search</Link>
        </nav>
        <Link href="/feed.xml" className="nav-pill">RSS</Link>
      </div>
    </header>
  );
}
