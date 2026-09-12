import type { Metadata } from "next";
import "./globals.css";
import "./directory.css";
import "./cms-category.css";
import "./media.css";
import "./account.css";
import "./nav-auth.css";
import "./intelligence.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { serializeJsonLd } from "@/lib/json-ld";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rapidreach.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "RapidReach — Developer News & Tool Intelligence", template: "%s | RapidReach" },
  description: "Developer news, analysis, tool comparisons, curated stacks, launch signals, and developer-tool discovery across modern software delivery.",
  keywords: ["developer news", "developer tools", "tool comparisons", "software engineering", "AI", "cloud native", "open source", "platform engineering"],
  alternates: { canonical: "/", types: { "application/rss+xml": "/feed.xml" } },
  openGraph: { type: "website", siteName: "RapidReach", title: "RapidReach — Developer News & Tool Intelligence", description: "Clear reporting and decision-ready developer tool intelligence for people who build software.", url: siteUrl },
  twitter: { card: "summary_large_image", title: "RapidReach", description: "Developer news and tool intelligence without the noise." },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const structuredData = { "@context": "https://schema.org", "@type": "NewsMediaOrganization", name: "RapidReach", url: siteUrl, description: "Developer news, analysis, comparisons, and developer-tool intelligence for software builders." };
  return <html lang="en"><body><a className="skip-link" href="#main">Skip to content</a><Header /><main id="main">{children}</main><Footer /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }} /></body></html>;
}
