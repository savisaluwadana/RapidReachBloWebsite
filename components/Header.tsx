import Link from "next/link";

const coverage = ["AI", "Cloud", "DevTools"];

export function Header() {
  return (
    <header className="site-header">
      <div className="shell nav-shell">
        <Link href="/" className="brand" aria-label="RapidReach home">
          <span className="brand-mark" aria-hidden="true">R</span>
          <span className="brand-lockup">
            <strong>RapidReach</strong>
            <small>Developer briefing</small>
          </span>
        </Link>

        <nav className="main-nav" aria-label="Primary navigation">
          <Link href="/#latest">Latest</Link>
          {coverage.map((item) => (
            <Link key={item} href={`/category/${item}`}>{item}</Link>
          ))}
          <Link className="nav-search" href="/search" aria-label="Search RapidReach">Search <span aria-hidden="true">⌕</span></Link>
        </nav>

        <Link href="/feed.xml" className="nav-pill">RSS <span aria-hidden="true">↗</span></Link>
      </div>

      <nav className="mobile-nav shell" aria-label="Mobile coverage navigation">
        <Link href="/#latest">Latest</Link>
        {coverage.map((item) => (
          <Link key={item} href={`/category/${item}`}>{item}</Link>
        ))}
        <Link href="/search">Search</Link>
      </nav>
    </header>
  );
}
