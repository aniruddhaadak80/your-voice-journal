import { Suspense } from "react";
import Link from "next/link";
import { getEntries, defaultUserId, fulltextSearchEntries } from "@/lib/db";
import { EntryCard, SearchBar } from "@/components/EntryList";
import { Button } from "@/components/ui";
import AskJournal from "@/components/AskJournal";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string; cursor?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const tag = sp.tag?.trim();
  const userId = defaultUserId();

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

      <SearchBar defaultValue={q} />
      <AskJournal />

      <Suspense fallback={<ListSkeleton />}>
        <EntryList q={q} tag={tag} userId={userId} cursor={sp.cursor} />
      </Suspense>
    </div>
  );
}

async function EntryList({ q, tag, userId, cursor }: { q: string; tag?: string; userId: string; cursor?: string }) {
  const raw = q
    ? await fulltextSearchEntries({ userId, query: q, limit: 21 })
    : await getEntries({ userId, limit: 20, cursor, search: undefined, tag });

  const hasMore = raw.length > 20;
  const entries = hasMore ? raw.slice(0, 20) : raw;
  const nextCursor = hasMore ? entries[entries.length - 1]?.id : undefined;

  if (!entries.length) {
    return (
      <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-zinc-500">
        No entries yet. <Link href="/entry/new" className="text-indigo-600 hover:underline">Write your first one →</Link>
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
          <Link href={`/?cursor=${nextCursor}${tag ? `&tag=${tag}` : ""}`}>
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
