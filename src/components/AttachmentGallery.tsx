"use client";

import type { Attachment } from "@prisma/client";

export default function AttachmentGallery({ items }: { items: Attachment[] }) {
  if (!items.length) return null;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((a) => (
        <div key={a.id} className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
          {a.type === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={a.url} alt={a.fileName} className="max-h-64 w-full object-cover" />
          ) : a.type === "video" ? (
            <video src={a.url} controls className="max-h-64 w-full" />
          ) : a.type === "audio" ? (
            <audio src={a.url} controls className="w-full p-3" />
          ) : (
            <a href={a.url} target="_blank" className="block p-4 text-sm text-indigo-600 hover:underline">
              📄 {a.fileName}
            </a>
          )}
          <div className="border-t border-zinc-100 px-3 py-1.5 text-xs text-zinc-500 dark:border-zinc-800">
            {a.fileName}
          </div>
        </div>
      ))}
    </div>
  );
}
