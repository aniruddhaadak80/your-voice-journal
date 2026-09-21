import type { MetadataRoute } from "next";

const BASE =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://your-voice-journal.vercel.app";

const ROUTES = [
  "/",
  "/connect",
  "/settings",
  "/showcase",
  "/showcase/kage",
  "/showcase/sketchbook",
  "/showcase/studio",
  "/entry/new",
  "/sign-in",
  "/sign-up",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({
    url: `${BASE}${route}`,
    lastModified: new Date(),
  }));
}
