export function aiConfigured() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export async function transcribeWithWhisper(audio: Blob | Buffer, mime = "audio/webm"): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY not configured");
  const form = new FormData();
  const file =
    audio instanceof Blob
      ? new File([audio], "voice.webm", { type: mime })
      : new File([new Uint8Array(audio)], "voice.webm", { type: mime });
  form.append("file", file);
  form.append("model", process.env.OPENAI_TRANSCRIBE_MODEL || "whisper-1");
  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: form,
  });
  if (!res.ok) throw new Error(`Transcription failed: ${res.status}`);
  const json = (await res.json()) as { text: string };
  return json.text ?? "";
}

export async function chatComplete(params: { system: string; user: string; model?: string }) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY not configured");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: params.model || process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: params.system },
        { role: "user", content: params.user },
      ],
      temperature: 0.4,
    }),
  });
  if (!res.ok) throw new Error(`AI request failed: ${res.status}`);
  const json = (await res.json()) as { choices: Array<{ message: { content: string } }> };
  return json.choices[0]?.message?.content ?? "";
}
