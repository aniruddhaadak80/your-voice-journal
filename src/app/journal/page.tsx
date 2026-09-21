import { Suspense } from "react";
import Link from "next/link";
import { tryGetEntries, trySearchEntries, type EntrySort } from "@/lib/db";
import { getUserId } from "@/lib/auth";
import { EntryCard, SearchBar } from "@/components/EntryList";
import { Button } from "@/components/ui";
import AskJournal from "@/components/AskJournal";
import ConnectBanner from "@/components/ConnectBanner";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Your journal",
  description: "Search, filter, ask and relive your entries.",
};

type SP = { q?: string; tag?: string; mood?: string; from?: string; to?: string; sort?: string; cursor?: string };

function journalHref(sp: SP, extra: Partial<SP> = {}) {
  const p = new URLSearchParams();
  const merged = { ...sp, ...extra };
  for (const [k, v] of Object.entries(merged)) {
    if (v) p.set(k, v);
  }
  const s = p.toString();
  return `/journal${s ? `?${s}` : ""}`;
}

export default async function Journal({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const tag = sp.tag?.trim();
  const mood = sp.mood?.trim();
  const from = sp.from?.trim();
  const to = sp.to?.trim();
  const sort: EntrySort = sp.sort === "oldest" ? "oldest" : "newest";
  const userId = await getUserId();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your journal</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Voice, text, images, video, PDFs — stored in your Neon Postgres + S3/R2.
          </p>
        </div>
        <Link href="/entry/new">
          <Button>+ New entry</Button>
        </Link>
      </div>

      <SearchBar defaults={{ q, tag, mood, from, to, sort }} />
      <AskJournal />

      <Suspense fallback={<ListSkeleton />}>
        <EntryList q={q} tag={tag} mood={mood} from={from} to={to} sort={sort} userId={userId} cursor={sp.cursor} sp={sp} />
      </Suspense>
    </div>
  );
}

async function EntryList({
  q, tag, mood, from, to, sort, userId, cursor, sp,
}: {
  q: string; tag?: string; mood?: string; from?: string; to?: string; sort: EntrySort;
  userId: string; cursor?: string; sp: SP;
}) {
  const result = q
    ? await trySearchEntries({ userId, query: q, limit: 21, mood, from, to, sort })
    : await tryGetEntries({ userId, limit: 20, cursor, search: undefined, tag, mood, from, to, sort });

  if (!result.dbOk) {
    return <ConnectBanner error={result.error} />;
  }

  const raw = result.entries;
  const hasMore = raw.length > 20;
  const entries = hasMore ? raw.slice(0, 20) : raw;
  const nextCursor = hasMore ? entries[entries.length - 1]?.id : undefined;

  if (!entries.length) {
    return (
      <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-zinc-500">
        No entries match. <Link href="/entry/new" className="text-blue-600 hover:underline">Write a new one →</Link>{" "}
        or <Link href="/journal" className="text-blue-600 hover:underline">clear filters</Link>.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((e, i) => (
        <EntryCard key={e.id} entry={e} index={i} />
      ))}
      {nextCursor && !q && (
        <div className="text-center">
          <Link href={journalHref(sp, { cursor: nextCursor })}>
            <Button variant="secondary">Load more</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-32 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
      ))}
    </div>
  );
}
