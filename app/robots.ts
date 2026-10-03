import type { MetadataRoute } from "next";
import { normalizedSiteUrl } from "@/lib/public-format";


export default function robots(): MetadataRoute.Robots {
  const siteUrl = normalizedSiteUrl();
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
