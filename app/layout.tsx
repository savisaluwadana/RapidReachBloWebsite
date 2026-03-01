import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CommandPalette from "@/components/CommandPalette";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: 'RapidReach — DevOps & Cloud Native Excellence',
    template: '%s | RapidReach',
  },
  description:
    'Master Kubernetes, Platform Engineering, GitOps, Terraform, and Cloud Native development. Free practitioner-written guides, learning paths, and real-time infrastructure news — built by Savi Saluwadana & team for the global DevOps community.',
  keywords: [
    'DevOps', 'Kubernetes', 'Platform Engineering', 'Cloud Native', 'Terraform',
    'AWS', 'GCP', 'Azure', 'GitOps', 'ArgoCD', 'CI/CD', 'Docker', 'Istio',
    'Observability', 'SRE', 'DevSecOps', 'Prometheus', 'Grafana', 'Helm',
    'free DevOps tutorials', 'Savi Saluwadana', 'RapidReach',
  ],
  authors: [{ name: 'Savi Saluwadana', url: 'https://rapidreach.blog/about' }],
  creator: 'Savi Saluwadana',
  publisher: 'RapidReach',
  metadataBase: new URL('https://rapidreach.blog'),
  alternates: { canonical: 'https://rapidreach.blog' },
  openGraph: {
    title: 'RapidReach — DevOps & Cloud Native Excellence',
    description:
      'Free Kubernetes, Terraform, GitOps, and Platform Engineering content built by Savi Saluwadana & team for the global DevOps community.',
    url: 'https://rapidreach.blog',
    siteName: 'RapidReach',
    type: 'website',
    locale: 'en_US',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'RapidReach — DevOps Knowledge Platform' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RapidReach — DevOps & Cloud Native Excellence',
    description: 'Free Kubernetes, Terraform, GitOps, and Cloud Native content for engineers worldwide.',
    images: ['/og-default.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large', 'max-video-preview': -1 },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Geo meta tags — signal global reach to search engines */}
        <meta name="geo.region" content="LK" />
        <meta name="geo.placename" content="Sri Lanka" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="3 days" />
        <meta name="rating" content="general" />
        <meta name="category" content="Technology, DevOps, Cloud Computing, Software Engineering" />
        <link rel="alternate" hrefLang="en" href="https://rapidreach.blog" />
        <link rel="alternate" hrefLang="x-default" href="https://rapidreach.blog" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-deep-charcoal text-white`}
      >
        <CommandPalette />
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1A1A1A',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            },
            success: {
              iconTheme: {
                primary: '#00FF88',
                secondary: '#1A1A1A',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
