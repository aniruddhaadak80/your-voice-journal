import { NextResponse } from "next/server";
import { transcribeWithWhisper, aiConfigured } from "@/lib/ai";
import { storageConfigured, uploadBufferToStorage } from "@/lib/s3";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!aiConfigured()) {
    return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 400 });
  }
  const form = await req.formData();
  const file = form.get("audio") as File | null;
  if (!file) return NextResponse.json({ error: "No audio" }, { status: 400 });
  const buffer = Buffer.from(await file.arrayBuffer());
  const text = await transcribeWithWhisper(buffer, file.type || "audio/webm");
  let audioUrl: string | undefined;
  if (storageConfigured()) {
    try {
      const up = await uploadBufferToStorage({
        buffer,
        fileName: file.name || "voice.webm",
        mimeType: file.type || "audio/webm",
      });
      audioUrl = up.url;
    } catch {
      audioUrl = undefined;
    }
  }
  return NextResponse.json({ transcript: text, audioUrl });
}
