import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-topline">
        <span>RapidReach / Developer briefing</span>
        <span>Signal over volume</span>
      </div>

      <div className="shell footer-grid">
        <div className="footer-intro">
          <div className="brand footer-brand"><span className="brand-mark">R</span><span>RapidReach</span></div>
          <p>Clear reporting and useful analysis for people who build software.</p>
        </div>

        <div className="footer-columns">
          <div>
            <span className="footer-label">Coverage</span>
            <div className="footer-links"><Link href="/category/AI">AI</Link><Link href="/category/Cloud">Cloud</Link><Link href="/category/DevTools">DevTools</Link><Link href="/search">Search</Link></div>
          </div>
          <div>
            <span className="footer-label">Machine access</span>
            <div className="footer-links"><Link href="/feed.xml">RSS</Link><Link href="/llms.txt">llms.txt</Link><Link href="/api/posts">Posts API</Link><Link href="/sitemap.xml">Sitemap</Link></div>
          </div>
        </div>
      </div>

      <div className="shell footer-wordmark" aria-hidden="true">RapidReach.</div>
      <div className="shell footer-bottom"><span>© {new Date().getFullYear()} RapidReach</span><span>Built for humans, search engines, and agents.</span></div>
    </footer>
  );
}
