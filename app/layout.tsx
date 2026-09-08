import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rapidreach.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "RapidReach — Developer News Without the Noise", template: "%s | RapidReach" },
  description: "Developer news and analysis across AI, cloud native, open source, web engineering, and developer tools.",
  keywords: ["developer news", "software engineering", "AI", "cloud native", "open source", "developer tools"],
  alternates: { canonical: "/", types: { "application/rss+xml": "/feed.xml" } },
  openGraph: { type: "website", siteName: "RapidReach", title: "RapidReach — Developer News Without the Noise", description: "Clear reporting and useful analysis for people who build software.", url: siteUrl },
  twitter: { card: "summary_large_image", title: "RapidReach", description: "Developer news without the noise." },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const structuredData = { "@context": "https://schema.org", "@type": "NewsMediaOrganization", name: "RapidReach", url: siteUrl, description: "Developer news and analysis for software builders." };
  return <html lang="en"><body><a className="skip-link" href="#main">Skip to content</a><Header /><main id="main">{children}</main><Footer /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} /></body></html>;
}
