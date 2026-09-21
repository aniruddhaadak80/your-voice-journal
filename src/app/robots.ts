import type { MetadataRoute } from "next";

const BASE =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://your-voice-journal.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Private-by-design: entries, APIs, auth flows stay out of indexes.
        disallow: ["/api/", "/entry/", "/journal", "/sign-in", "/sign-up", "/settings"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
