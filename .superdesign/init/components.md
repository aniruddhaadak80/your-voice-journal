# Shared UI primitives — your-voice-journal

Framework: Next.js 15 (App Router) + React 19. Styling: Tailwind CSS v4 (CSS-first, no config file). Icons: lucide-react. Motion: framer-motion. Class helper: `cn()` in `src/lib/format.ts` (simple truthy join, NOT clsx).

```ts
// src/lib/format.ts
export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}
```

## Button / Card / Badge / Field / inputCls

- Path: `src/components/ui.tsx`
- Description: The four primitives used on every page.

```tsx
import { cn } from "@/lib/format";
import { ButtonHTMLAttributes } from "react";

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" | "secondary" }) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-50",
        variant === "primary" && "bg-indigo-600 text-white hover:bg-indigo-500 shadow",
        variant === "secondary" && "bg-zinc-200 text-zinc-900 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700",
        variant === "ghost" && "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
        variant === "danger" && "bg-red-600 text-white hover:bg-red-500",
        className
      )}
    />
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80",
        className
      )}
    >
      {children}
    </div>
  );
}

export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
      #{children}
    </span>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-zinc-600 dark:text-zinc-300">{label}</span>
      {children}
    </label>
  );
}

export const inputCls =
  "w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-indigo-900";
```

## EntryCard + SearchBar

- Path: `src/components/EntryList.tsx` (client component)
- Description: Journal entry preview card with stagger-in animation; search input syncing `?q=`.
- Key props: `EntryCard({ entry, index })`, `SearchBar({ defaultValue })`.

```tsx
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
```

## ThemeToggle

- Path: `src/components/ThemeToggle.tsx` (client)
- Description: Dark-mode toggle flipping `.dark` on `<html>` (Tailwind v4 custom variant).

```tsx
"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);
  return (
    <button
      aria-label="Toggle theme"
      onClick={() => {
        const el = document.documentElement;
        el.classList.toggle("dark");
        setDark(el.classList.contains("dark"));
      }}
      className="rounded-xl p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
```

## VoiceRecorder

- Path: `src/components/VoiceRecorder.tsx` (client)
- Description: Mic record → MediaRecorder → POST `/api/transcribe` → transcript callback.
- Key props: `onTranscribed(transcript: string, audioUrl?: string)`.

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { Button } from "./ui";

export default function VoiceRecorder({
  onTranscribed,
}: {
  onTranscribed: (transcript: string, audioUrl?: string) => void;
}) {
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => () => mediaRef.current?.stream.getTracks().forEach((t) => t.stop()), []);

  async function start() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : undefined });
      chunksRef.current = [];
      mr.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      mr.onstop = async () => {
        setBusy(true);
        try {
          const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" });
          const form = new FormData();
          form.append("audio", blob, "voice.webm");
          const res = await fetch("/api/transcribe", { method: "POST", body: form });
          const json = await res.json();
          if (!res.ok) throw new Error(json.error || "Transcription failed");
          onTranscribed(json.transcript ?? "", json.audioUrl);
        } catch (e) {
          setError((e as Error).message);
        } finally {
          setBusy(false);
        }
      };
      mediaRef.current = mr;
      mr.start();
      setRecording(true);
    } catch {
      setError("Microphone permission denied.");
    }
  }

  function stop() {
    mediaRef.current?.stop();
    mediaRef.current?.stream.getTracks().forEach((t) => t.stop());
    setRecording(false);
  }

  return (
    <div className="flex items-center gap-2">
      {!recording ? (
        <Button type="button" variant="secondary" onClick={start} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
          {busy ? "Transcribing…" : "Record voice"}
        </Button>
      ) : (
        <Button type="button" variant="danger" onClick={stop}>
          <Square className="h-4 w-4" /> Stop
        </Button>
      )}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
```

## UploadZone

- Path: `src/components/UploadZone.tsx` (client)
- Description: Dashed drag/click file drop → POST `/api/upload` per file → URL callback.
- Key props: `entryId?: string`, `onUploaded(url: string)`.

```tsx
"use client";

import { useState } from "react";
import { UploadCloud } from "lucide-react";

export default function UploadZone({ entryId, onUploaded }: { entryId?: string; onUploaded: (url: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function handle(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setMsg("");
    try {
      for (const f of Array.from(files)) {
        const form = new FormData();
        form.append("file", f);
        if (entryId) form.append("entryId", entryId);
        const res = await fetch("/api/upload", { method: "POST", body: form });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Upload failed");
        onUploaded(json.url);
      }
      setMsg("Uploaded ✓");
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-500 hover:border-indigo-400 dark:border-zinc-700">
      <UploadCloud className="h-5 w-5 text-indigo-500" />
      <span>{busy ? "Uploading…" : "Drop images, video, audio, PDFs here or click to browse"}</span>
      <input type="file" multiple className="hidden" onChange={(e) => handle(e.target.files)} />
      {msg && <span className="ml-auto text-xs">{msg}</span>}
    </label>
  );
}
```

## Other feature components (summaries — full code in source files)

- `src/components/Editor.tsx` — TipTap rich-text editor (StarterKit + Image + Link + Placeholder "Write your mind…"), toolbar B/I/H1/H2/lists/quote/code, `min-h-[280px] rounded-2xl border` content area. Props: `initial?: string`, `onChange(html)`. Dynamically imported with `ssr: false`.
- `src/components/AskJournal.tsx` — indigo AI panel (`border-indigo-200 bg-indigo-50/60`, Sparkles icon, "Ask my journal (AI + full-text retrieval)"), input + Ask button → POST `/api/ai` `{mode:"ask"}`.
- `src/components/AttachmentGallery.tsx` — `grid sm:grid-cols-2` of image/video/audio/file cards with filename footer. Props: `items: Attachment[]`.
- `src/components/NewEntryForm.tsx` — composes Field+inputCls, Editor, transcript box, VoiceRecorder, UploadZone, tags/mood grid, Save + "✨ Suggest tags" + "Summarize" buttons.
- `src/components/EditEntryForm.tsx` — edit variant used on `/entry/[id]`.
- `src/components/ExportButtons.tsx` — JSON/Markdown export download buttons (settings page).
- `src/components/ConnectTester.tsx` — backend connection test cards + `EnvGenerator` (connect page).
- `src/components/ConnectBanner.tsx` — DB-error fallback banner on home/entry pages.
