"use client";

import { useState } from "react";
import { Button } from "./ui";

export default function ExportButtons() {
  const [busy, setBusy] = useState("");
  async function download(kind: "json" | "markdown") {
    setBusy(kind);
    try {
      const res = await fetch(`/api/export?format=${kind}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `journal.${kind === "json" ? "json" : "md"}`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy("");
    }
  }
  return (
    <div className="flex gap-2">
      <Button variant="secondary" onClick={() => download("json")}>{busy === "json" ? "…" : "JSON"}</Button>
      <Button variant="secondary" onClick={() => download("markdown")}>{busy === "markdown" ? "…" : "Markdown"}</Button>
    </div>
  );
}
