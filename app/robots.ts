import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rapidreach.dev";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/dashboard/", "/for-you", "/login", "/register", "/submit-tool", "/api/comments", "/api/media/", "/api/admin/"],
    }],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
