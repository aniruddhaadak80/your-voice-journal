"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { Button } from "./ui";

export default function VoiceRecorder({
  onTranscribed,
}: {
  onTranscribed: (transcript: string, audioUrl?: string) => void;
}) {
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => () => mediaRef.current?.stream.getTracks().forEach((t) => t.stop()), []);

  async function start() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : undefined });
      chunksRef.current = [];
      mr.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      mr.onstop = async () => {
        setBusy(true);
        try {
          const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" });
          const form = new FormData();
          form.append("audio", blob, "voice.webm");
          const res = await fetch("/api/transcribe", { method: "POST", body: form });
          const json = await res.json();
          if (!res.ok) throw new Error(json.error || "Transcription failed");
          onTranscribed(json.transcript ?? "", json.audioUrl);
        } catch (e) {
          setError((e as Error).message);
        } finally {
          setBusy(false);
        }
      };
      mediaRef.current = mr;
      mr.start();
      setRecording(true);
    } catch {
      setError("Microphone permission denied.");
    }
  }

  function stop() {
    mediaRef.current?.stop();
    mediaRef.current?.stream.getTracks().forEach((t) => t.stop());
    setRecording(false);
  }

  return (
    <div className="flex items-center gap-2">
      {!recording ? (
        <Button type="button" variant="secondary" onClick={start} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
          {busy ? "Transcribing…" : "Record voice"}
        </Button>
      ) : (
        <Button type="button" variant="danger" onClick={stop}>
          <Square className="h-4 w-4" /> Stop
        </Button>
      )}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
