import Link from "next/link";
import { tryGetEntryById } from "@/lib/db";
import { getUserId } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { Badge, Card } from "@/components/ui";
import AttachmentGallery from "@/components/AttachmentGallery";
import EditEntryForm from "@/components/EditEntryForm";
import ConnectBanner from "@/components/ConnectBanner";

export const dynamic = "force-dynamic";

export default async function EntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { entry, dbOk, error } = await tryGetEntryById({ id, userId: await getUserId() });

  if (!dbOk) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Entry unavailable</h1>
        <ConnectBanner error={error} />
      </div>
    );
  }

  if (!entry) {
    return (
      <Card>
        <h1 className="text-xl font-bold">Entry not found</h1>
        <p className="mt-1 text-sm text-zinc-500">
          It may have been deleted or belong to another account.{" "}
          <Link href="/" className="text-indigo-600 hover:underline">Back to journal →</Link>
        </p>
      </Card>
    );
  }

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
