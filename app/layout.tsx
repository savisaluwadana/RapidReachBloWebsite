import type { Metadata } from "next";
import "./globals.css";
import "./directory.css";
import "./cms-category.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rapidreach.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "RapidReach — Developer News & Tool Discovery", template: "%s | RapidReach" },
  description: "Developer news, analysis, and curated developer-tool discovery across AI, cloud native, open source, platform engineering, and modern software delivery.",
  keywords: ["developer news", "developer tools", "software engineering", "AI", "cloud native", "open source", "platform engineering"],
  alternates: { canonical: "/", types: { "application/rss+xml": "/feed.xml" } },
  openGraph: { type: "website", siteName: "RapidReach", title: "RapidReach — Developer News & Tool Discovery", description: "Clear reporting and curated developer tools for people who build software.", url: siteUrl },
  twitter: { card: "summary_large_image", title: "RapidReach", description: "Developer news and tool discovery without the noise." },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const structuredData = { "@context": "https://schema.org", "@type": "NewsMediaOrganization", name: "RapidReach", url: siteUrl, description: "Developer news, analysis, and developer-tool discovery for software builders." };
  return <html lang="en"><body><a className="skip-link" href="#main">Skip to content</a><Header /><main id="main">{children}</main><Footer /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} /></body></html>;
}
