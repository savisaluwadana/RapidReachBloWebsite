import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // Cache static assets aggressively
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },

  // Optimise external images
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 3600,
  },

  // Shorten client-router cache TTL so dynamic pages feel fresh
  experimental: {
    staleTimes: {
      dynamic: 30,   // 30s for dynamic pages (was 0)
      static: 300,   // 5 min for static pages
    },
  },
};

export default nextConfig;
