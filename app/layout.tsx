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
  title: "RapidReach - DevOps & Cloud Native Excellence",
  description: "Master Kubernetes, Platform Engineering, and Cloud Native development with real-time updates, interactive learning paths, and expert insights.",
  keywords: ["DevOps", "Kubernetes", "Platform Engineering", "Cloud Native", "Terraform", "AWS", "GCP", "Azure"],
  authors: [{ name: "RapidReach Team" }],
  openGraph: {
    title: "RapidReach - DevOps & Cloud Native Excellence",
    description: "Master Kubernetes, Platform Engineering, and Cloud Native development",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
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
