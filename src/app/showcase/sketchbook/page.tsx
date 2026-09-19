import Link from "next/link";

export const metadata = {
  title: "Sketchbook — Singapore Sketchbook Portfolio",
  description: "A tactile sketchbook: illustrated plates, curled page turns, draggable magnifier, zoom controls.",
};

export default function SketchbookPage() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Sketchbook 📖</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Singapore sketchbook — page turns, draggable magnifier, zoom. Artwork: ThreeUI
            (@designcodeio/threeui, MIT), embedded unmodified.
          </p>
        </div>
        <Link href="/showcase" className="text-sm font-semibold text-indigo-600 hover:underline">
          ← All showcases
        </Link>
      </div>
      <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <iframe
          src="/landing-pages/meng-to-sketchbook.html"
          title="Meng To sketchbook"
          className="h-[78vh] w-full"
          sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-downloads"
        />
      </div>
    </div>
  );
}
