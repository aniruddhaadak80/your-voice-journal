import Link from "next/link";
import { BookOpenText, Plus, PlugZap, Settings, Sparkles, SquareTerminal } from "lucide-react";
import { tryGetEntries } from "@/lib/db";
import { getUserId } from "@/lib/auth";
import StudioStatus from "./_components/StudioStatus";
import StudioTerminal from "./_components/StudioTerminal";

export const metadata = {
  title: "Studio OS — Monochrome Journal Console",
  description: "A black-and-white studio OS for the journal: live diagnostics, entry cells, dock, terminal.",
};

export const dynamic = "force-dynamic";

function DockLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      title={label}
      aria-label={label}
      className="rounded-xl p-2.5 text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
    >
      {icon}
    </Link>
  );
}

export default async function StudioPage() {
  const userId = await getUserId();
  const result = await tryGetEntries({ userId, limit: 6 });
  const entries = result.dbOk ? result.entries : [];
  const voiced = entries.filter((e) => (e.transcript ?? "").trim().length > 0).length;
  const withAudio = entries.filter((e) => Boolean(e.audioUrl)).length;
  const tags = new Set(entries.flatMap((e) => e.tags)).size;

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
            Showcase · third experience
          </p>
          <h1 className="text-2xl font-bold">Studio OS 🖥️</h1>
          <p className="mt-1 text-sm text-zinc-500">
            A monochrome console for the journal — strictly black, white, gray.
          </p>
        </div>
        <Link href="/showcase" className="text-sm font-semibold text-zinc-600 hover:underline dark:text-zinc-300">
          ← All showcases
        </Link>
      </div>

      <StudioStatus stats={{ cells: entries.length, voiced, withAudio, tags }} />

      <section aria-label="Journal cells">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
          Project cells
        </h2>
        {!result.dbOk ? (
          <p className="mt-2 text-sm text-zinc-500">
            Database not connected —{" "}
            <Link href="/connect" className="font-semibold underline">finish /connect →</Link>
          </p>
        ) : entries.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">
            No cells yet.{" "}
            <Link href="/entry/new" className="font-semibold underline">Write the first entry →</Link>
          </p>
        ) : (
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {entries.map((e) => (
              <Link
                key={e.id}
                href={`/entry/${e.id}`}
                className="rounded-2xl border border-zinc-200 bg-white p-4 transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate text-sm font-bold">{e.title || "Untitled"}</h3>
                  {e.mood && <span className="shrink-0 text-sm">{e.mood}</span>}
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-zinc-500">
                  {(e.plainText || "—").slice(0, 140)}
                </p>
                <p className="mt-2 text-[11px] text-zinc-400">
                  {new Date(e.createdAt).toISOString().slice(0, 10)}
                  {e.tags.length > 0 && ` · ${e.tags.slice(0, 3).join(", ")}`}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <StudioTerminal cellTitles={entries.map((e) => e.title || "Untitled")} />

      <nav
        aria-label="Utility dock"
        className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1 rounded-2xl bg-zinc-950/90 px-3 py-2 shadow-lg backdrop-blur"
      >
        <DockLink href="/journal" label="Journal" icon={<BookOpenText className="h-5 w-5" />} />
        <DockLink href="/entry/new" label="New entry" icon={<Plus className="h-5 w-5" />} />
        <DockLink href="/connect" label="Connect" icon={<PlugZap className="h-5 w-5" />} />
        <DockLink href="/settings" label="Settings" icon={<Settings className="h-5 w-5" />} />
        <DockLink href="/showcase" label="Showcase" icon={<Sparkles className="h-5 w-5" />} />
        <DockLink href="#studio-terminal" label="Terminal" icon={<SquareTerminal className="h-5 w-5" />} />
      </nav>
    </div>
  );
}
