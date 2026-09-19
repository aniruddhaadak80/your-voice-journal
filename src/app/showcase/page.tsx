import Link from "next/link";
import { Card, Button } from "@/components/ui";

export const metadata = {
  title: "Showcase — Immersive Experiences",
  description: "Full-screen authored experiences embedded in the journal: Kage temple and Singapore sketchbook.",
};

const SHOWS = [
  {
    href: "/showcase/kage",
    title: "Kage ⛩️",
    text: "Temple journey with scroll scenes, ember light and a local Three.js world. Scroll, move the pointer, use the keyboard.",
  },
  {
    href: "/showcase/sketchbook",
    title: "Sketchbook 📖",
    text: "Singapore sketchbook with curled page turns, a draggable magnifying glass, zoom controls and botanical paper atmosphere.",
  },
];

export default function ShowcasePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Showcase ✨</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Full-screen authored experiences, embedded unmodified. Each one is unique — pick a world.
        </p>
      </div>
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
        Artwork: ThreeUI (@designcodeio/threeui v1.2.0, MIT). A third experience (monochrome studio OS,
        sublevel-style) is planned next via the Superdesign canvas.
      </p>
    </div>
  );
}
