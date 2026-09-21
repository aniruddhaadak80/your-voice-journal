"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { updateEntryAction, deleteEntryAction } from "@/actions/entries";
import { Button, Field, inputCls } from "@/components/ui";
import UploadZone from "@/components/UploadZone";
import RequireSignIn, { clerkOn, useSignInGate, GateLoading } from "@/components/RequireSignIn";

const Editor = dynamic(() => import("@/components/Editor"), { ssr: false });

type EntryProp = { id: string; title: string; content: string; tags: string[]; mood?: string | null };

export default function EditEntryForm({ entry }: { entry: EntryProp }) {
  if (!clerkOn) return <EditEntryBox entry={entry} />;
  return <GatedEditEntry entry={entry} />;
}

function GatedEditEntry({ entry }: { entry: EntryProp }) {
  const { isSignedIn, isLoaded } = useSignInGate();
  if (!isLoaded) return <GateLoading />;
  if (!isSignedIn) return <RequireSignIn action="edit and save this entry" />;
  return <EditEntryBox entry={entry} />;
}

function EditEntryBox({ entry }: { entry: EntryProp }) {
  const router = useRouter();
  const [title, setTitle] = useState(entry.title);
  const [content, setContent] = useState(entry.content);
  const [tags, setTags] = useState(entry.tags.join(", "));
  const [mood, setMood] = useState(entry.mood ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function save() {
    setBusy(true);
    setErr("");
    try {
      await updateEntryAction({ id: entry.id, title, content, tags, mood });
      router.refresh();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm("Delete this entry?")) return;
    await deleteEntryAction(entry.id);
    router.push("/journal");
  }

  return (
    <div className="space-y-4">
      <Field label="Title">
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
      </Field>
      <Editor initial={entry.content} onChange={setContent} />
      <UploadZone entryId={entry.id} onUploaded={(url) => setContent((c) => `${c}<p><a href="${url}">${url}</a></p>`)} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Tags">
          <input value={tags} onChange={(e) => setTags(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Mood">
          <input value={mood} onChange={(e) => setMood(e.target.value)} className={inputCls} />
        </Field>
      </div>
      {err && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">{err}</p>}
      <div className="flex gap-2">
        <Button onClick={save} disabled={busy}>{busy ? "Saving…" : "Save changes"}</Button>
        <Button variant="danger" onClick={remove}>Delete</Button>
      </div>
    </div>
  );
}
