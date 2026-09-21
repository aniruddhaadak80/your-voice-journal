import Link from "next/link";
import prisma from "@/lib/prisma";
import { getDbStatus } from "@/lib/db";
import { getUserId, clerkConfigured } from "@/lib/auth";
import { storageConfigured } from "@/lib/s3";
import { aiConfigured } from "@/lib/ai";
import { Card } from "@/components/ui";
import ExportButtons from "@/components/ExportButtons";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const db = await getDbStatus();
  const userId = await getUserId();
  let count = 0;
  let migrated: boolean | null = null;
  if (db.ok) {
    try {
      count = await prisma.journalEntry.count({ where: { userId, isDeleted: false } });
      migrated = true;
    } catch {
      migrated = false;
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Settings & status</h1>
        <Link href="/connect" className="text-sm font-semibold text-blue-600 hover:underline">
          Open Connect wizard →
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <h3 className="font-semibold">Neon Postgres</h3>
          <p className="mt-1 text-sm">
            {db.ok && migrated ? "🟢 Connected" : db.ok ? "🟡 Reachable but tables missing — run migrations" : "🔴 Not connected"}
          </p>
          {!db.ok && <p className="mt-1 text-xs text-zinc-500">{db.error} — see <Link href="/connect" className="text-blue-600 hover:underline">/connect</Link></p>}
          {db.ok && !migrated && (
            <p className="mt-1 text-xs text-zinc-500">Run <code>prisma migrate deploy</code> against your DATABASE_URL.</p>
          )}
          <p className="mt-1 text-xs text-zinc-500">{count} entries · user {userId}</p>
        </Card>
        <Card>
          <h3 className="font-semibold">Object storage (S3/R2)</h3>
          <p className="mt-1 text-sm">{storageConfigured() ? "🟢 Configured" : "🟡 Not configured — uploads disabled"}</p>
          <p className="mt-1 text-xs text-zinc-500">Bucket: {process.env.S3_BUCKET ?? "(unset)"}</p>
        </Card>
        <Card>
          <h3 className="font-semibold">AI / Voice (Gemini)</h3>
          <p className="mt-1 text-sm">{aiConfigured() ? "🟢 Enabled (Gemini BYOK)" : "🟡 Disabled — set GEMINI_API_KEY"}</p>
          <p className="mt-1 text-xs text-zinc-500">Gemini transcription, summaries, tags, Ask-my-journal.</p>
        </Card>
        <Card>
          <h3 className="font-semibold">Auth (Clerk)</h3>
          <p className="mt-1 text-sm">{clerkConfigured() ? "🟢 Enabled — each user has private data" : "🟡 Demo mode — single shared user"}</p>
          <p className="mt-1 text-xs text-zinc-500">
            {clerkConfigured() ? `Signed-in user data is isolated by Clerk id.` : <>Add Clerk keys to give every visitor their own journal. See <Link href="/connect" className="text-blue-600 hover:underline">/connect</Link>.</>}
          </p>
        </Card>
        <Card>
          <h3 className="font-semibold">Export</h3>
          <p className="mt-1 text-xs text-zinc-500">Download everything as JSON or Markdown.</p>
          <div className="mt-2"><ExportButtons /></div>
        </Card>
      </div>
    </div>
  );
}
