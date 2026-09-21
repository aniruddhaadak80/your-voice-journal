"use client";

import { useCallback, useEffect, useState } from "react";

type Status = { db: string; storage: string; ai: string; userId: string };

function Dot({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      className={`inline-block h-2.5 w-2.5 rounded-full ${
        on ? "bg-zinc-950 dark:bg-zinc-100" : "border border-zinc-400"
      }`}
    />
  );
}

function Cell({ label, value, on }: { label: string; value: string; on: boolean }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
        <Dot on={on} /> {label}
      </div>
      <div className="mt-1 truncate text-sm font-semibold">{value}</div>
    </div>
  );
}

export default function StudioStatus({
  stats,
}: {
  stats: { cells: number; voiced: number; withAudio: number; tags: number };
}) {
  const [status, setStatus] = useState<Status | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/status");
      setStatus(await res.json());
    } catch {
      setStatus(null);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const ok = (v?: string) => v === "connected" || (v?.startsWith("configured") ?? false);

  return (
    <section aria-label="Diagnostics strip" className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
          Diagnostics
        </h2>
        <button
          onClick={load}
          disabled={busy}
          className="rounded-xl border border-zinc-300 px-3 py-1 text-xs font-semibold hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          {busy ? "…" : "Refresh"}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Cell label="Database" value={status?.db ?? "…"} on={ok(status?.db)} />
        <Cell label="Storage" value={status?.storage ?? "…"} on={ok(status?.storage)} />
        <Cell label="AI" value={status?.ai ?? "…"} on={ok(status?.ai)} />
        <Cell label="User" value={status?.userId ?? "…"} on={Boolean(status?.userId)} />
      </div>
      <p className="text-xs text-zinc-500">
        Latest 6 cells · {stats.cells} shown · {stats.voiced} voiced · {stats.withAudio} with
        audio · {stats.tags} tags
      </p>
    </section>
  );
}
