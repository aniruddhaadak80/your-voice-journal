import Link from "next/link";

export const metadata = {
  title: "Kage — Interactive Temple Experience",
  description: "The authored Kage temple journey: scroll scenes, pointer and keyboard interaction, local Three.js world.",
};

export default function KagePage() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Kage ⛩️</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Interactive temple journey — scroll scenes, pointer + keyboard. Artwork: ThreeUI
            (@designcodeio/threeui, MIT), embedded unmodified.
          </p>
        </div>
        <Link href="/showcase" className="text-sm font-semibold text-blue-600 hover:underline">
          ← All showcases
        </Link>
      </div>
      <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <iframe
          src="/landing-pages/kage.html"
          title="Kage temple experience"
          className="h-[78vh] w-full"
          sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-downloads"
        />
      </div>
    </div>
  );
}
