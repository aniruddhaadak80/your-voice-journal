"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, XCircle, Copy } from "lucide-react";
import { Card, inputCls } from "./ui";

type Kind = "neon" | "s3" | "gemini" | "clerk";

const FIELDS: Record<Kind, Array<{ key: string; label: string; placeholder: string; secret?: boolean }>> = {
  neon: [{ key: "url", label: "Neon connection string", placeholder: "postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require", secret: true }],
  s3: [
    { key: "endpoint", label: "Endpoint (R2: https://<account>.r2.cloudflarestorage.com, S3: empty)", placeholder: "https://" },
    { key: "region", label: "Region (R2: auto)", placeholder: "auto" },
    { key: "bucket", label: "Bucket", placeholder: "journal-media" },
    { key: "keyId", label: "Access key ID", placeholder: "" },
    { key: "secret", label: "Secret access key", placeholder: "", secret: true },
  ],
  gemini: [
    { key: "key", label: "Gemini API key", placeholder: "AIza…", secret: true },
    { key: "model", label: "Model", placeholder: "gemini-3.5-flash" },
  ],
  clerk: [
    { key: "publishable", label: "Publishable key (pk_…)", placeholder: "pk_test_…" },
    { key: "secret", label: "Secret key (sk_…)", placeholder: "sk_test_…", secret: true },
  ],
};

const TITLES: Record<Kind, string> = {
  neon: "1 · Test Neon Postgres",
  s3: "2 · Test object storage (R2/S3)",
  gemini: "3 · Test Gemini AI",
  clerk: "4 · Test Clerk auth",
};

export default function ConnectTester() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {(Object.keys(FIELDS) as Kind[]).map((kind) => (
        <TesterCard key={kind} kind={kind} />
      ))}
    </div>
  );
}

function TesterCard({ kind }: { kind: Kind }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message?: string; error?: string } | null>(null);

  async function test() {
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/connect/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, values }),
      });
      setResult(await res.json());
    } catch (e) {
      setResult({ ok: false, error: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <h3 className="font-semibold">{TITLES[kind]}</h3>
      <p className="mt-0.5 text-xs text-zinc-500">Values are only used for this one test — never stored.</p>
      <div className="mt-3 space-y-2">
        {FIELDS[kind].map((f) => (
          <label key={f.key} className="block">
            <span className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-300">{f.label}</span>
            <input
              type={f.secret ? "password" : "text"}
              value={values[f.key] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
              className={inputCls}
              autoComplete="off"
              spellCheck={false}
            />
          </label>
        ))}
      </div>
      <button
        onClick={test}
        disabled={busy}
        className="mt-3 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" />} Test connection
      </button>
      {result && (
        <div className={`mt-2 flex items-start gap-2 rounded-xl p-3 text-sm ${result.ok ? "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200" : "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200"}`}>
          {result.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0" />}
          <span>{result.ok ? result.message : result.error}</span>
        </div>
      )}
    </Card>
  );
}

export function EnvGenerator() {
  const [v, setV] = useState<Record<string, string>>({ region: "auto", bucket: "journal-media", model: "gemini-3.5-flash" });
  const [copied, setCopied] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setV((prev) => ({ ...prev, [k]: e.target.value }));

  const env = `# Generated in /connect — paste into .env (local) or Vercel env vars
DATABASE_URL="${v.db ?? ""}"
DEFAULT_USER_ID="demo-user"
DEFAULT_USER_EMAIL="you@example.com"
S3_ENDPOINT="${v.endpoint ?? ""}"
S3_REGION="${v.region ?? "auto"}"
S3_BUCKET="${v.bucket ?? "journal-media"}"
S3_ACCESS_KEY_ID="${v.keyId ?? ""}"
S3_SECRET_ACCESS_KEY="${v.s3secret ?? ""}"
S3_PUBLIC_BASE_URL="${v.publicUrl ?? ""}"
GEMINI_API_KEY="${v.gemini ?? ""}"
GEMINI_MODEL="${v.model ?? "gemini-3.5-flash"}"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="${v.clerkPub ?? ""}"
CLERK_SECRET_KEY="${v.clerkSecret ?? ""}"
NEXT_PUBLIC_APP_NAME="Your Voice Journal"`;

  async function copy() {
    await navigator.clipboard.writeText(env);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const row = (k: string, label: string, secret = false) => (
    <label key={k} className="block">
      <span className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-300">{label}</span>
      <input type={secret ? "password" : "text"} value={v[k] ?? ""} onChange={set(k)} className={inputCls} autoComplete="off" spellCheck={false} />
    </label>
  );

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">5 · Generate your env file</h3>
        <button onClick={copy} className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
          <Copy className="h-3.5 w-3.5" /> {copied ? "Copied ✓" : "Copy .env"}
        </button>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {row("db", "DATABASE_URL", true)}
        {row("endpoint", "S3_ENDPOINT")}
        {row("region", "S3_REGION")}
        {row("bucket", "S3_BUCKET")}
        {row("keyId", "S3_ACCESS_KEY_ID")}
        {row("s3secret", "S3_SECRET_ACCESS_KEY", true)}
        {row("publicUrl", "S3_PUBLIC_BASE_URL")}
        {row("gemini", "GEMINI_API_KEY", true)}
        {row("model", "GEMINI_MODEL")}
        {row("clerkPub", "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY")}
        {row("clerkSecret", "CLERK_SECRET_KEY", true)}
      </div>
      <pre className="mt-3 overflow-x-auto rounded-xl bg-zinc-950 p-4 text-xs text-zinc-100">{env}</pre>
      <p className="mt-2 text-xs text-zinc-500">
        Local: save as <code>.env</code> → run <code>prisma migrate deploy</code>. Vercel: paste each value at
        Project → Settings → Environment Variables → Redeploy.
      </p>
    </Card>
  );
}
