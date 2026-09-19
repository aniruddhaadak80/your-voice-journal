"use server";

import { revalidatePath } from "next/cache";
import { createEntry, updateEntry, deleteEntry, defaultUserId } from "@/lib/db";
import { stripHtml } from "@/lib/format";

function parseTags(raw?: string | string[]) {
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : raw.split(",");
  return [...new Set(arr.map((t) => t.trim().replace(/^#/, "")).filter(Boolean))].slice(0, 20);
}

export async function createEntryAction(form: {
  title: string;
  content: string;
  tags?: string | string[];
  mood?: string;
  transcript?: string;
  audioUrl?: string;
}) {
  const userId = defaultUserId();
  const entry = await createEntry({
    userId,
    title: form.title,
    content: form.content,
    plainText: stripHtml(form.content).slice(0, 20000),
    transcript: form.transcript ?? "",
    tags: parseTags(form.tags),
    mood: form.mood,
    audioUrl: form.audioUrl,
  });
  revalidatePath("/");
  return { id: entry.id };
}

export async function updateEntryAction(form: {
  id: string;
  title?: string;
  content?: string;
  tags?: string | string[];
  mood?: string;
  transcript?: string;
  audioUrl?: string;
}) {
  const userId = defaultUserId();
  await updateEntry({
    id: form.id,
    userId,
    ...(form.title !== undefined ? { title: form.title } : {}),
    ...(form.content !== undefined
      ? { content: form.content, plainText: stripHtml(form.content).slice(0, 20000) }
      : {}),
    ...(form.tags !== undefined ? { tags: parseTags(form.tags) } : {}),
    ...(form.mood !== undefined ? { mood: form.mood } : {}),
    ...(form.transcript !== undefined ? { transcript: form.transcript } : {}),
    ...(form.audioUrl !== undefined ? { audioUrl: form.audioUrl } : {}),
  });
  revalidatePath("/");
  revalidatePath(`/entry/${form.id}`);
  return { ok: true };
}

export async function deleteEntryAction(id: string) {
  await deleteEntry({ id, userId: defaultUserId() });
  revalidatePath("/");
  return { ok: true };
}
