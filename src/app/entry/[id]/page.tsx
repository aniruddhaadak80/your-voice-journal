import { notFound } from "next/navigation";
import { getEntryById, defaultUserId } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { Badge, Card } from "@/components/ui";
import AttachmentGallery from "@/components/AttachmentGallery";
import EditEntryForm from "@/components/EditEntryForm";

export const dynamic = "force-dynamic";

export default async function EntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entry = await getEntryById({ id, userId: defaultUserId() });
  if (!entry) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{entry.title}</h1>
        <p className="mt-1 text-sm text-zinc-500">{formatDateTime(entry.createdAt)}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {entry.tags.map((t) => (
            <Badge key={t}>{t}</Badge>
          ))}
        </div>
      </div>

      <Card>
        <div className="prose max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: entry.content || "<p>No content.</p>" }} />
        {entry.transcript && (
          <details className="mt-4 rounded-xl bg-zinc-50 p-3 text-sm dark:bg-zinc-900">
            <summary className="cursor-pointer font-semibold">🎙️ Voice transcript</summary>
            <p className="mt-2 whitespace-pre-wrap">{entry.transcript}</p>
            {entry.audioUrl && <audio src={entry.audioUrl} controls className="mt-2 w-full" />}
          </details>
        )}
      </Card>

      <AttachmentGallery items={entry.attachments} />

      <div className="border-t pt-6">
        <h2 className="mb-3 font-semibold">Edit</h2>
        <EditEntryForm entry={entry} />
      </div>
    </div>
  );
}
