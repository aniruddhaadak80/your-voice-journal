import Link from "next/link";
import { PlugZap } from "lucide-react";

export default function ConnectBanner({ error }: { error?: string }) {
  return (
    <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-50 p-6 dark:border-blue-900 dark:from-blue-950/50 dark:to-blue-950/30">
      <div className="flex items-center gap-2 font-semibold text-blue-800 dark:text-blue-200">
        <PlugZap className="h-5 w-5" />
        Connect your own database to start journaling
      </div>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
        This app stores everything in <strong>your</strong> Neon Postgres + object storage — nothing is shared.
        {error ? (
          <>
            {" "}Current status: <code className="rounded bg-zinc-200/70 px-1 text-xs dark:bg-zinc-800">{error}</code>
          </>
        ) : null}
      </p>
      <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-300">
        <li>Get a free Neon DB + paste the connection string</li>
        <li>Add an R2/S3 bucket for photos, videos & PDFs</li>
        <li>Drop in a free Gemini key for voice + AI</li>
      </ol>
      <Link
        href="/connect"
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-blue-500 active:scale-[0.98]"
      >
        <PlugZap className="h-4 w-4" /> Open the Connect wizard →
      </Link>
    </div>
  );
}
