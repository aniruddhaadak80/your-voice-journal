"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import RequireSignIn, { clerkOn, useSignInGate, GateLoading } from "@/components/RequireSignIn";

export default function AskJournal() {
  if (!clerkOn) return <AskBox />;
  return <GatedAsk />;
}

function GatedAsk() {
  const { isSignedIn, isLoaded } = useSignInGate();
  if (!isLoaded) return <GateLoading />;
  if (!isSignedIn) return <RequireSignIn action="chat with your journal" />;
  return <AskBox />;
}

function AskBox() {
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [deep, setDeep] = useState(false);

  async function ask() {
    if (!q.trim()) return;
    setBusy(true);
    setAnswer("");
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "ask", query: q, deep }),
      });
      const json = await res.json();
      setAnswer(json.result || json.error || "No answer.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 dark:border-blue-900 dark:bg-blue-950/30">
      <div className="flex items-center gap-2 text-sm font-semibold text-blue-700 dark:text-blue-300">
        <Sparkles className="h-4 w-4" /> Ask my journal (AI + full-text retrieval)
      </div>
      <div className="mt-2 flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          placeholder="e.g. What did I learn about agents last month?"
          className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm outline-none dark:border-blue-900 dark:bg-zinc-950"
        />
        <button
          onClick={ask}
          disabled={busy}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {busy ? "Thinking…" : "Ask"}
        </button>
      </div>
      <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
        <input type="checkbox" checked={deep} onChange={(e) => setDeep(e.target.checked)} className="accent-blue-600" />
        Deep search — AI expands your question into keywords first
      </label>
      {answer && <p className="mt-2 whitespace-pre-wrap text-sm">{answer}</p>}
    </div>
  );
}
