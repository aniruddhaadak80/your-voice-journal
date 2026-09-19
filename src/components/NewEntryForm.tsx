"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { createEntryAction } from "@/actions/entries";
import { Button, Field, inputCls } from "@/components/ui";
import VoiceRecorder from "@/components/VoiceRecorder";
import UploadZone from "@/components/UploadZone";

const Editor = dynamic(() => import("@/components/Editor"), { ssr: false });

export default function NewEntryForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [mood, setMood] = useState("");
  const [transcript, setTranscript] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      const { id } = await createEntryAction({ title, content, tags, mood, transcript, audioUrl });
      router.push(`/entry/${id}`);
    } finally {
      setBusy(false);
    }
  }

  async function ai(mode: "summarize" | "tags") {
    setAiBusy(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, text: content.replace(/<[^>]*>/g, " ") + "\n" + transcript }),
      });
      const json = await res.json();
      if (mode === "tags" && json.result) setTags(json.result);
      if (mode === "summarize" && json.result) alert(json.result);
    } finally {
      setAiBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <Field label="Title">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="A quiet morning…" className={inputCls} />
      </Field>
      <Editor initial="" onChange={setContent} />
      {transcript && (
        <div className="rounded-2xl border bg-zinc-50 p-3 text-sm dark:bg-zinc-900">
          <div className="font-semibold">🎙️ Transcript</div>
          <p className="mt-1 whitespace-pre-wrap">{transcript}</p>
        </div>
      )}
      <VoiceRecorder
        onTranscribed={(t, url) => {
          setTranscript((prev) => (prev ? prev + "\n" + t : t));
          if (url) setAudioUrl(url);
        }}
      />
      <UploadZone onUploaded={(url) => setContent((c) => `${c}<p><a href="${url}">${url}</a></p>`)} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Tags (comma separated)">
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="ideas, voice, travel" className={inputCls} />
        </Field>
        <Field label="Mood (emoji or word)">
          <input value={mood} onChange={(e) => setMood(e.target.value)} placeholder="✨ / calm / focused" className={inputCls} />
        </Field>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={save} disabled={busy}>{busy ? "Saving…" : "Save entry"}</Button>
        <Button variant="secondary" onClick={() => ai("tags")} disabled={aiBusy}>✨ Suggest tags</Button>
        <Button variant="ghost" onClick={() => ai("summarize")} disabled={aiBusy}>Summarize</Button>
      </div>
    </div>
  );
}
