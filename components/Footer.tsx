import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer"><div className="shell footer-grid"><div><div className="brand footer-brand"><span className="brand-mark">R</span><span>RapidReach</span></div><p>Clear reporting and useful analysis for people who build software.</p></div><div className="footer-links"><Link href="/feed.xml">RSS</Link><Link href="/llms.txt">llms.txt</Link><Link href="/api/posts">Posts API</Link><Link href="/sitemap.xml">Sitemap</Link></div></div><div className="shell footer-bottom"><span>© {new Date().getFullYear()} RapidReach</span><span>Built for humans, search engines, and agents.</span></div></footer>
  );
}
