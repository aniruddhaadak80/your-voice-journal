import prisma from "@/lib/prisma";
import { defaultUserId } from "@/lib/db";
import { storageConfigured } from "@/lib/s3";
import { aiConfigured } from "@/lib/ai";
import { Card } from "@/components/ui";
import ExportButtons from "@/components/ExportButtons";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const dbOk = await prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false);
  const count = dbOk ? await prisma.journalEntry.count({ where: { userId: defaultUserId(), isDeleted: false } }) : 0;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Settings & status</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <h3 className="font-semibold">Neon Postgres</h3>
          <p className="mt-1 text-sm">{dbOk ? "🟢 Connected" : "🔴 Not connected — set DATABASE_URL"}</p>
          <p className="mt-1 text-xs text-zinc-500">{count} entries · user {defaultUserId()}</p>
        </Card>
        <Card>
          <h3 className="font-semibold">Object storage (S3/R2)</h3>
          <p className="mt-1 text-sm">{storageConfigured() ? "🟢 Configured" : "🟡 Not configured — uploads disabled"}</p>
          <p className="mt-1 text-xs text-zinc-500">Bucket: {process.env.S3_BUCKET ?? "(unset)"}</p>
        </Card>
        <Card>
          <h3 className="font-semibold">AI / Voice</h3>
          <p className="mt-1 text-sm">{aiConfigured() ? "🟢 Enabled (Gemini BYOK)" : "🟡 Disabled — set GEMINI_API_KEY"}</p>
          <p className="mt-1 text-xs text-zinc-500">Gemini transcription, summaries, tags, Ask-my-journal.</p>
        </Card>
        <Card>
          <h3 className="font-semibold">Export</h3>
          <p className="mt-1 text-xs text-zinc-500">Download everything as JSON or Markdown.</p>
          <div className="mt-2"><ExportButtons /></div>
        </Card>
      </div>
      <Card>
        <h3 className="font-semibold">Bring-your-own-DB</h3>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-300">
          <li>Create a free Neon project, copy the connection string.</li>
          <li>Set <code>DATABASE_URL</code> in Vercel/host env or <code>.env</code>.</li>
          <li>Run <code>npx prisma migrate deploy</code>.</li>
          <li>Create an R2/S3 bucket + keys for media, set <code>S3_*</code> vars.</li>
        </ol>
      </Card>
    </div>
  );
}
