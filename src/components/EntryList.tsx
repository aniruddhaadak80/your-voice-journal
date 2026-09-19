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

export function SearchBar({ defaultValue }: { defaultValue?: string }) {
  const [q, setQ] = useState(defaultValue ?? "");
  return (
    <form action="/" method="get" className="flex gap-2">
      <input
        name="q"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search entries, tags, transcripts…"
        className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900"
      />
      <button className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
        Search
      </button>
    </form>
  );
}
