import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://prime-imdb-web.vercel.app";
  return {
    rules: [{ userAgent:"*", allow:"/", disallow:["/search", "/watchlist"] }],
    sitemap: origin.replace(/\/$/, "") + "/sitemap.xml",
  };
}
