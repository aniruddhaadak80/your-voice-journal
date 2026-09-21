import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: process.env.NEXT_PUBLIC_APP_NAME || "Your Voice Journal",
    short_name: "Journal",
    description: "AI voice + multimedia journal on your own Postgres + storage.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#09090b",
  };
}
