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
