import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Card } from "@/components/ui";
import ConnectTester, { EnvGenerator } from "@/components/ConnectTester";

export const metadata = {
  title: "Connect your own backends — Your Voice Journal",
  description: "Step-by-step: connect Neon Postgres, R2/S3 storage, Gemini AI and Clerk auth.",
};

function Step({
  n,
  title,
  href,
  linkLabel,
  children,
}: {
  n: string;
  title: string;
  href: string;
  linkLabel: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold">{n} · {title}</h3>
        <a href={href} target="_blank" className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-blue-600 hover:underline">
          {linkLabel} <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-300">{children}</ol>
    </Card>
  );
}

export default function ConnectPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Connect your own backends 🔌</h1>
        <p className="mt-1 max-w-2xl text-sm text-zinc-500">
          No shared database, no shared keys. Create each service free, test it below, then paste values into
          your <code>.env</code> (local) or Vercel → Settings → Environment Variables (hosted). New here? Do
          steps 1–3 — that&apos;s enough to start journaling.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Step n="Step 1" title="Neon Postgres (journal data)" href="https://console.neon.tech" linkLabel="console.neon.tech">
          <li>Create account → <strong>New Project</strong> (Postgres 16, free tier is plenty).</li>
          <li>Open <strong>Dashboard → Connection Details</strong>, copy the <strong>connection string</strong> (ends with <code>?sslmode=require</code>).</li>
          <li>Test it below, then save as <code>DATABASE_URL</code>.</li>
          <li>After saving: run <code>prisma migrate deploy</code> once to create tables (<Link href="https://neon.tech/docs/connect/connect-from-any-app" target="_blank" className="text-blue-600 hover:underline">docs</Link>).</li>
        </Step>
        <Step n="Step 2" title="Object storage (photos, video, PDFs)" href="https://dash.cloudflare.com" linkLabel="dash.cloudflare.com (R2)">
          <li>R2 → <strong>Create bucket</strong> (e.g. <code>journal-media</code>).</li>
          <li>R2 → <strong>Manage API tokens → Create token</strong> (Object Read & Write) — copy key id + secret.</li>
          <li>Endpoint looks like <code>https://&lt;account&gt;.r2.cloudflarestorage.com</code>, region <code>auto</code>.</li>
          <li>Optional public URL: bucket → Settings → Public access (<Link href="https://developers.cloudflare.com/r2/" target="_blank" className="text-blue-600 hover:underline">R2 docs</Link>). AWS S3 works too (<Link href="https://s3.console.aws.amazon.com" target="_blank" className="text-blue-600 hover:underline">S3 console</Link>).</li>
        </Step>
        <Step n="Step 3" title="Gemini AI (voice + summaries)" href="https://aistudio.google.com/apikey" linkLabel="aistudio.google.com/apikey">
          <li>Sign in → <strong>Create API key</strong> (free tier).</li>
          <li>Test below with model <code>gemini-3.5-flash</code>.</li>
          <li>Save as <code>GEMINI_API_KEY</code> (+ optional <code>GEMINI_MODEL</code>).</li>
        </Step>
        <Step n="Step 4" title="Clerk auth (per-user journals)" href="https://dashboard.clerk.com" linkLabel="dashboard.clerk.com">
          <li>Create application → pick sign-in methods (Google, email…).</li>
          <li>Copy <strong>Publishable key</strong> (<code>pk_…</code>) + <strong>Secret key</strong> (<code>sk_…</code>) from API keys (<Link href="https://clerk.com/docs/quickstarts/nextjs" target="_blank" className="text-blue-600 hover:underline">Next.js guide</Link>).</li>
          <li>Save both env vars + <strong>redeploy</strong> so middleware picks them up.</li>
          <li>Without keys the app runs in single-user demo mode — nothing breaks.</li>
        </Step>
      </div>

      <ConnectTester />

      <EnvGenerator />

      <Card>
        <h3 className="font-semibold">Only-you checklist (dashboards the assistant can&apos;t click for you)</h3>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-300">
          <li>Clerk <strong>production</strong> keys (<code>pk_live_…</code>/<code>sk_live_…</code>) + enable Google under SSO / Social connections → Vercel env → <strong>Redeploy</strong>.</li>
          <li>Storage keys (<code>S3_*</code>) → Vercel env → <strong>Redeploy</strong> (uploads stay off until then).</li>
          <li>Check <code>/api/status</code>: want connected / configured everywhere, and your user id instead of <code>demo-user</code>.</li>
          <li>Full step-by-step with links: README section “Production status &amp; manual checklist” (<Link href="https://github.com/aniruddhaadak80/your-voice-journal#--production-status--manual-checklist-only-you-can-do-these" target="_blank" className="text-blue-600 hover:underline">open on GitHub →</Link>).</li>
        </ol>
      </Card>

      <Card>
        <h3 className="font-semibold">Step 6 · Deploy / redeploy on Vercel</h3>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-300">
          <li>Import the repo: <Link href="https://vercel.com/new" target="_blank" className="text-blue-600 hover:underline">vercel.com/new</Link> → select <code>your-voice-journal</code>.</li>
          <li>Paste env vars at Project → Settings → <strong>Environment Variables</strong> → <strong>Redeploy</strong>.</li>
          <li>Run once locally: <code>DATABASE_URL=… pnpm exec prisma migrate deploy</code> (+ <code>pnpm run db:seed</code> for demo entries).</li>
          <li>Open <code>/api/status</code> — all three should read “connected/configured”.</li>
        </ol>
      </Card>
    </div>
  );
}
