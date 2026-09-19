"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

export default function AskJournal() {
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);

  async function ask() {
    if (!q.trim()) return;
    setBusy(true);
    setAnswer("");
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "ask", query: q }),
      });
      const json = await res.json();
      setAnswer(json.result || json.error || "No answer.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 dark:border-indigo-900 dark:bg-indigo-950/30">
      <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700 dark:text-indigo-300">
        <Sparkles className="h-4 w-4" /> Ask my journal (AI + full-text retrieval)
      </div>
      <div className="mt-2 flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          placeholder="e.g. What did I learn about agents last month?"
          className="w-full rounded-xl border border-indigo-200 bg-white px-3 py-2 text-sm outline-none dark:border-indigo-900 dark:bg-zinc-950"
        />
        <button
          onClick={ask}
          disabled={busy}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {busy ? "Thinking…" : "Ask"}
        </button>
      </div>
      {answer && <p className="mt-2 whitespace-pre-wrap text-sm">{answer}</p>}
    </div>
  );
}
