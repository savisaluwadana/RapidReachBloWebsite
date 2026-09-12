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

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://rapidreach.dev").replace(/\/+$/, "");
const description = "RapidReach tracks what is changing across AI engineering, developer tools, cloud-native infrastructure, open source, and software building — then explains why it matters.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "RapidReach",
  title: { default: "RapidReach — Developer Intelligence", template: "%s | RapidReach" },
  description,
  keywords: ["developer intelligence", "developer news", "developer tools", "AI engineering", "cloud native", "open source", "platform engineering", "software engineering", "DevOps", "Kubernetes"],
  authors: [{ name: "RapidReach Editorial" }],
  creator: "RapidReach",
  publisher: "RapidReach",
  category: "technology",
  referrer: "origin-when-cross-origin",
  alternates: { types: { "application/rss+xml": "/feed.xml" } },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: "RapidReach",
    title: "RapidReach — Developer Intelligence",
    description: "Signal for people who build software: fast-moving developer news, practical analysis, and tool intelligence.",
    url: siteUrl,
    locale: "en_US",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "RapidReach — Developer Intelligence" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "RapidReach — Developer Intelligence",
    description: "Signal for people who build software.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const organizationId = `${siteUrl}/#organization`;
  const websiteId = `${siteUrl}/#website`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["NewsMediaOrganization", "Organization"],
        "@id": organizationId,
        name: "RapidReach",
        url: siteUrl,
        description,
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/brand/rapidreach-logo.png`,
          contentUrl: `${siteUrl}/brand/rapidreach-logo.png`,
          caption: "RapidReach",
        },
        publishingPrinciples: `${siteUrl}/about`,
        ethicsPolicy: `${siteUrl}/about`,
        knowsAbout: ["AI engineering", "developer tools", "cloud-native infrastructure", "open source", "platform engineering", "DevOps", "Kubernetes", "software engineering"],
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: siteUrl,
        name: "RapidReach",
        description,
        publisher: { "@id": organizationId },
        inLanguage: "en",
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${siteUrl}/search?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
  return <html lang="en"><body><a className="skip-link" href="#main">Skip to content</a><Header /><main id="main">{children}</main><Footer /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }} /></body></html>;
}
