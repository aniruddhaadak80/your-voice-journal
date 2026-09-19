// Gemini-powered AI layer (BYOK via GEMINI_API_KEY).
// Get a free key: https://aistudio.google.com/apikey
// Chat/summaries/tags use generateContent; voice transcription sends
// the audio bytes as inlineData to a multimodal Gemini model.

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

export function aiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY);
}

export function geminiModel() {
  return process.env.GEMINI_MODEL || "gemini-3.5-flash";
}

type GeminiPart = { text: string } | { inlineData: { mimeType: string; data: string } };

async function generateContent(params: { system?: string; parts: GeminiPart[]; model?: string }) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY not configured");
  const model = params.model || geminiModel();
  const res = await fetch(`${GEMINI_API_BASE}/models/${model}:generateContent?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...(params.system ? { systemInstruction: { parts: [{ text: params.system }] } } : {}),
      contents: [{ parts: params.parts }],
      generationConfig: { temperature: 0.4 },
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Gemini request failed: ${res.status} ${text.slice(0, 200)}`);
  }
  const json = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return (
    json.candidates?.[0]?.content?.parts
      ?.map((p) => p.text ?? "")
      .join("") ?? ""
  );
}

function toBase64(audio: Blob | Buffer): Promise<string> {
  if (audio instanceof Blob) {
    return audio.arrayBuffer().then((buf) => Buffer.from(buf).toString("base64"));
  }
  return Promise.resolve(audio.toString("base64"));
}

// Kept the same export name so existing callers don't change.
export async function transcribeWithWhisper(audio: Blob | Buffer, mime = "audio/webm"): Promise<string> {
  const base64 = await toBase64(audio);
  return generateContent({
    system: "You are a speech-to-text engine. Transcribe the attached audio exactly, no commentary.",
    parts: [
      { text: "Transcribe this voice journal recording verbatim:" },
      { inlineData: { mimeType: mime, data: base64 } },
    ],
  });
}

export async function transcribeWithGemini(audio: Blob | Buffer, mime = "audio/webm"): Promise<string> {
  return transcribeWithWhisper(audio, mime);
}

export async function chatComplete(params: { system: string; user: string; model?: string }) {
  return generateContent({ system: params.system, parts: [{ text: params.user }], model: params.model });
}
