import type { Metadata } from "next";
import "./globals.css";
import "./directory.css";
import "./cms-category.css";
import "./media.css";
import "./account.css";
import "./nav-auth.css";
import "./intelligence.css";
import "./cms-layout.css";
import "./collection-picker.css";
import "./article-editor.css";
import "./brand.css";
import "./comment-actions.css";
import "./responsive.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { serializeJsonLd } from "@/lib/json-ld";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rapidreach.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "RapidReach — Developer Intelligence", template: "%s | RapidReach" },
  description: "RapidReach tracks what is changing across AI engineering, developer tools, cloud-native infrastructure, and software building — then explains why it matters.",
  keywords: ["developer intelligence", "developer news", "developer tools", "AI engineering", "cloud native", "open source", "platform engineering", "software engineering"],
  alternates: { canonical: "/", types: { "application/rss+xml": "/feed.xml" } },
  openGraph: { type: "website", siteName: "RapidReach", title: "RapidReach — Developer Intelligence", description: "Signal for people who build software: fast-moving developer news, practical analysis, and tool intelligence.", url: siteUrl },
  twitter: { card: "summary_large_image", title: "RapidReach — Developer Intelligence", description: "Signal for people who build software." },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const structuredData = { "@context": "https://schema.org", "@type": "NewsMediaOrganization", name: "RapidReach", url: siteUrl, description: "Developer intelligence covering AI engineering, developer tools, cloud-native infrastructure, open source, and software building." };
  return <html lang="en"><body><a className="skip-link" href="#main">Skip to content</a><Header /><main id="main">{children}</main><Footer /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }} /></body></html>;
}
