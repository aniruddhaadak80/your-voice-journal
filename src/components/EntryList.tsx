"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { JournalEntry, Attachment } from "@prisma/client";
import Link from "next/link";
import { formatDateTime, snippetOf, timeAgo } from "@/lib/format";
import { Badge, Card } from "./ui";

export type EntryWithAttachments = JournalEntry & { attachments: Attachment[] };

export function EntryCard({ entry, index = 0 }: { entry: EntryWithAttachments; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.4) }}
    >
      <Link href={`/entry/${entry.id}`}>
        <Card className="transition hover:shadow-md hover:-translate-y-0.5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold leading-snug">{entry.title}</h3>
              <p className="mt-1 text-xs text-zinc-500">
                {formatDateTime(entry.createdAt)} · {timeAgo(entry.createdAt)}
              </p>
            </div>
            {entry.mood && <span className="text-lg" title="mood">{entry.mood}</span>}
          </div>
          <p className="mt-2 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-300">
            {snippetOf(entry.plainText || entry.transcript || "") || "No content yet."}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {entry.tags.slice(0, 6).map((t) => (
              <Badge key={t}>{t}</Badge>
            ))}
            {entry.attachments.length > 0 && (
              <span className="text-xs text-zinc-500">📎 {entry.attachments.length}</span>
            )}
            {entry.audioUrl && <span className="text-xs text-zinc-500">🎙️ voice</span>}
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

export type SearchDefaults = {
  q?: string;
  tag?: string;
  mood?: string;
  from?: string;
  to?: string;
  sort?: string;
};

const inputSm =
  "w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-zinc-700 dark:bg-zinc-900";

export function SearchBar({ defaults }: { defaults?: SearchDefaults }) {
  const [q, setQ] = useState(defaults?.q ?? "");
  const [tag, setTag] = useState(defaults?.tag ?? "");
  const [mood, setMood] = useState(defaults?.mood ?? "");
  const [from, setFrom] = useState(defaults?.from ?? "");
  const [to, setTo] = useState(defaults?.to ?? "");
  const [sort, setSort] = useState(defaults?.sort ?? "newest");
  const filtered = tag || mood || from || to || (sort && sort !== "newest");
  return (
    <form action="/journal" method="get" className="space-y-2 rounded-2xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex gap-2">
        <input
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search entries, tags, transcripts…"
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <button className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-500 active:scale-[0.98]">
          Search
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        <input name="tag" value={tag} onChange={(e) => setTag(e.target.value)} placeholder="tag" aria-label="Filter by tag" className={inputSm} />
        <input name="mood" value={mood} onChange={(e) => setMood(e.target.value)} placeholder="mood" aria-label="Filter by mood" className={inputSm} />
        <input name="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="From date" className={inputSm} />
        <input name="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} aria-label="To date" className={inputSm} />
        <select name="sort" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort order" className={inputSm}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>
      {filtered ? (
        <div>
          <a href="/journal" className="text-xs font-semibold text-blue-600 hover:underline">
            Clear filters →
          </a>
        </div>
      ) : null}
    </form>
  );
}
