import Link from "next/link";
import { Card, Button } from "@/components/ui";

export const metadata = {
  title: "Showcase — Immersive Experiences",
  description: "Full‑screen authored experiences (Kage, Sketchbook). Free to browse.",
};

// Browsing is free for everyone — sign-in is only required for WRITES
// (journal entries, uploads, AI chat, connecting/saving keys).
const SHOWS = [
  {
    href: "/showcase/kage",
    title: "Kage ⛩️",
    text: "Temple journey with scroll scenes, ember light and a local Three.js world.",
  },
  {
    href: "/showcase/sketchbook",
    title: "Sketchbook 📖",
    text: "Singapore sketchbook with curled page turns, magnifier, zoom. Artwork: ThreeUI.",
  },
  {
    href: "/showcase/studio",
    title: "Studio OS 🖥️",
    text: "Monochrome journal console — live diagnostics, entry cells, dock, terminal.",
  },
];

export default function ShowcasePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Showcase ✨</h1>
      <p className="text-sm text-zinc-500">
        Full‑screen authored experiences, embedded unmodified. Each one is unique – pick a world.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {SHOWS.map((s) => (
          <Card key={s.href} className="flex flex-col gap-3">
            <h2 className="text-xl font-bold">{s.title}</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">{s.text}</p>
            <Link href={s.href} className="mt-auto">
              <Button>Open experience →</Button>
            </Link>
          </Card>
        ))}
      </div>
      <p className="text-xs text-zinc-500">
        Artwork: ThreeUI (@designcodeio/threeui v1.2.0, MIT).
      </p>
    </div>
  );
}
