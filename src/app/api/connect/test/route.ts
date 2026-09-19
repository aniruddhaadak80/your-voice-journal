import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

export const runtime = "nodejs";

type TestRequest = {
  kind: "neon" | "s3" | "gemini" | "clerk";
  values: Record<string, string>;
};

export async function POST(req: Request) {
  let body: TestRequest;
  try {
    body = (await req.json()) as TestRequest;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  try {
    if (body.kind === "neon") return NextResponse.json(await testNeon(body.values));
    if (body.kind === "s3") return NextResponse.json(await testS3(body.values));
    if (body.kind === "gemini") return NextResponse.json(await testGemini(body.values));
    if (body.kind === "clerk") return NextResponse.json(await testClerk(body.values));
    return NextResponse.json({ ok: false, error: "Unknown kind" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message.split("\n")[0].slice(0, 300) });
  }
}

async function testNeon(v: Record<string, string>) {
  const url = v.url?.trim();
  if (!url) return { ok: false, error: "Paste a connection string first." };
  const client = new PrismaClient({ datasources: { db: { url } } });
  try {
    await client.$queryRaw`SELECT 1`;
    // Tables present?
    let migrated = false;
    try {
      await client.journalEntry.count();
      migrated = true;
    } catch {
      migrated = false;
    }
    return {
      ok: true,
      message: migrated
        ? "Connected ✓ — tables exist, you're ready."
        : "Connected ✓ — but tables are missing. Run: prisma migrate deploy",
      migrated,
    };
  } finally {
    await client.$disconnect();
  }
}

async function testS3(v: Record<string, string>) {
  const { endpoint, region, bucket, keyId, secret } = v;
  if (!bucket || !keyId || !secret) return { ok: false, error: "Bucket + key id + secret are required." };
  const client = new S3Client({
    region: region?.trim() || "auto",
    endpoint: endpoint?.trim() || undefined,
    forcePathStyle: Boolean(endpoint?.trim()),
    credentials: { accessKeyId: keyId.trim(), secretAccessKey: secret.trim() },
  });
  await client.send(new ListObjectsV2Command({ Bucket: bucket.trim(), MaxKeys: 1 }));
  return { ok: true, message: `Bucket "${bucket.trim()}" is readable ✓ — uploads will work.` };
}

async function testGemini(v: Record<string, string>) {
  const key = v.key?.trim();
  const model = v.model?.trim() || "gemini-3.5-flash";
  if (!key) return { ok: false, error: "Paste an API key first." };
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: "Reply with exactly: OK" }] }] }),
    }
  );
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    return { ok: false, error: `Gemini rejected the key (${res.status}). ${t.slice(0, 160)}` };
  }
  return { ok: true, message: `Gemini answered ✓ — model "${model}" works for chat, tags & voice.` };
}

async function testClerk(v: Record<string, string>) {
  const secret = v.secret?.trim();
  if (!secret) return { ok: false, error: "Paste the Clerk secret key first." };
  const res = await fetch("https://api.clerk.com/v1/users?limit=1", {
    headers: { Authorization: `Bearer ${secret}` },
  });
  if (!res.ok) return { ok: false, error: `Clerk rejected the secret (${res.status}). Check dashboard.clerk.com → API keys.` };
  const pub = v.publishable?.trim();
  const pubOk = !pub || pub.startsWith("pk_");
  return {
    ok: pubOk,
    message: pubOk
      ? "Clerk secret is valid ✓ — add both keys as env vars + redeploy to enable sign-in."
      : "Secret is valid, but the publishable key should start with pk_.",
  };
}
