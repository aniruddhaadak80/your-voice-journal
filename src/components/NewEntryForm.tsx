"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { createEntryAction } from "@/actions/entries";
import { Button, Field, inputCls } from "@/components/ui";
import VoiceRecorder from "@/components/VoiceRecorder";
import UploadZone from "@/components/UploadZone";
import RequireSignIn, { clerkOn, useSignInGate, GateLoading } from "@/components/RequireSignIn";

const Editor = dynamic(() => import("@/components/Editor"), { ssr: false });

export default function NewEntryForm() {
  if (!clerkOn) return <NewEntryBox />;
  return <GatedNewEntry />;
}

function GatedNewEntry() {
  const { isSignedIn, isLoaded } = useSignInGate();
  if (!isLoaded) return <GateLoading />;
  if (!isSignedIn) return <RequireSignIn action="write and save journal entries" />;
  return <NewEntryBox />;
}

function NewEntryBox() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [mood, setMood] = useState("");
  const [transcript, setTranscript] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [err, setErr] = useState("");

  async function save() {
    setBusy(true);
    setErr("");
    try {
      const { id } = await createEntryAction({ title, content, tags, mood, transcript, audioUrl });
      router.push(`/entry/${id}`);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function ai(mode: "summarize" | "tags" | "title" | "mood") {
    setAiBusy(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, text: content.replace(/<[^>]*>/g, " ") + "\n" + transcript }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "AI failed");
      if (mode === "tags" && json.result) setTags(json.result);
      if (mode === "title" && json.result) setTitle(json.result.trim().split("\n")[0]);
      if (mode === "mood" && json.result) setMood(json.result.trim().split(/\s+/)[0].toLowerCase());
      if (mode === "summarize" && json.result) alert(json.result);
    } catch (e) {
      setErr((e as Error).message);
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
      {err && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">{err}</p>}
      <div className="flex flex-wrap gap-2">
        <Button onClick={save} disabled={busy}>{busy ? "Saving…" : "Save entry"}</Button>
        <Button variant="secondary" onClick={() => ai("title")} disabled={aiBusy}>✨ Title</Button>
        <Button variant="secondary" onClick={() => ai("tags")} disabled={aiBusy}>✨ Tags</Button>
        <Button variant="secondary" onClick={() => ai("mood")} disabled={aiBusy}>✨ Mood</Button>
        <Button variant="ghost" onClick={() => ai("summarize")} disabled={aiBusy}>Summarize</Button>
      </div>
    </div>
  );
}
