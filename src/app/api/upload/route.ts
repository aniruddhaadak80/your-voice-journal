import { NextResponse } from "next/server";
import { isAllowedMime, classifyMime, storageConfigured, uploadBufferToStorage, MAX_UPLOAD_BYTES } from "@/lib/s3";
import { createAttachment, getEntryById, dbConfigured } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!dbConfigured()) {
    return NextResponse.json({ error: "Database not connected — finish /connect first" }, { status: 400 });
  }
  if (!storageConfigured()) {
    return NextResponse.json({ error: "S3/R2 not configured" }, { status: 400 });
  }
  const form = await req.formData();
  const file = form.get("file") as File | null;
  const entryId = (form.get("entryId") as string | null) ?? undefined;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "File too large (max 50MB)" }, { status: 400 });
  }
  if (!isAllowedMime(file.type)) {
    return NextResponse.json({ error: `Unsupported type: ${file.type}` }, { status: 400 });
  }
  let userId: string;
  try {
    userId = await requireUserId();
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
  if (entryId) {
    const entry = await getEntryById({ id: entryId, userId });
    if (!entry) return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const { key, url } = await uploadBufferToStorage({
    buffer,
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
  });
  let attachment = null;
  if (entryId) {
    attachment = await createAttachment({
      entryId,
      url,
      type: classifyMime(file.type),
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
    });
  } else {
    // orphan upload (used before entry exists); still return URL
    await prisma.attachment.create({
      data: {
        entryId: await ensureDraftEntry(userId),
        url,
        type: classifyMime(file.type),
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
      },
    });
  }
  return NextResponse.json({ url, key, attachment });
}

async function ensureDraftEntry(userId: string) {
  // Reuse latest empty draft or create one so FK stays valid.
  const existing = await prisma.journalEntry.findFirst({
    where: { userId, isDeleted: false, title: "Untitled", plainText: "" },
    orderBy: { createdAt: "desc" },
  });
  if (existing) return existing.id;
  const created = await prisma.journalEntry.create({
    data: { userId, title: "Untitled", content: "", plainText: "" },
  });
  return created.id;
}
