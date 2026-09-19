"use server";

import { revalidatePath } from "next/cache";
import { createEntry, updateEntry, deleteEntry, dbConfigured } from "@/lib/db";
import { getUserId } from "@/lib/auth";
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
  if (!dbConfigured()) throw new Error("Database not connected — finish /connect first.");
  const userId = await getUserId();
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
  if (!dbConfigured()) throw new Error("Database not connected — finish /connect first.");
  const userId = await getUserId();
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
  if (!dbConfigured()) throw new Error("Database not connected — finish /connect first.");
  await deleteEntry({ id, userId: await getUserId() });
  revalidatePath("/");
  return { ok: true };
}
