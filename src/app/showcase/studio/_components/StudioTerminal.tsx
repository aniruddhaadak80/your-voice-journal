"use client";

import { useEffect, useRef, useState } from "react";

const ROUTES = [
  "/",
  "/entry/new",
  "/connect",
  "/settings",
  "/showcase",
  "/showcase/kage",
  "/showcase/sketchbook",
  "/showcase/studio",
];

const PROMPT = "guest@studio-os:~$";

// Read-only console: inspects the app, never writes. Monospace lives
// ONLY inside this module (per the Studio OS visual direction).
export default function StudioTerminal({ cellTitles }: { cellTitles: string[] }) {
  const [lines, setLines] = useState<string[]>(["studio-os v1.0 — type `help`."]);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight });
  }, [lines]);

  async function run(raw: string) {
    const input = raw.trim();
    if (!input) return;
    setBusy(true);
    try {
      const [name, ...args] = input.split(/\s+/);
      const out: string[] = [`${PROMPT} ${input}`];
      switch (name.toLowerCase()) {
        case "help":
          out.push("commands: help · status · routes · cells · whoami · date · open <route> · clear");
          break;
        case "status": {
          try {
            const j = await (await fetch("/api/status")).json();
            out.push(`db: ${j.db}`, `storage: ${j.storage}`, `ai: ${j.ai}`, `user: ${j.userId}`);
          } catch {
            out.push("status unreachable");
          }
          break;
        }
        case "routes":
          ROUTES.forEach((r) => out.push(r));
          break;
        case "cells":
          if (!cellTitles.length) out.push("(no cells yet — write your first entry)");
          else cellTitles.forEach((t, i) => out.push(`${i + 1}. ${t}`));
          break;
        case "whoami": {
          try {
            const j = await (await fetch("/api/status")).json();
            out.push(String(j.userId));
          } catch {
            out.push("unknown");
          }
          break;
        }
        case "date":
          out.push(new Date().toString());
          break;
        case "open": {
          const target = args[0] ?? "";
          if (ROUTES.includes(target)) {
            setLines((prev) => [...prev, `${PROMPT} ${input}`, `opening ${target}…`]);
            window.location.href = target;
            return;
          }
          out.push(`unknown route. try: ${ROUTES.join("  ")}`);
          break;
        }
        case "clear":
          setLines([]);
          return;
        default:
          out.push(`unknown command: ${name} — type help`);
      }
      setLines((prev) => [...prev, ...out]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="studio-terminal" aria-label="Studio terminal" className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center gap-1.5 border-b border-zinc-200 bg-zinc-100 px-4 py-2 dark:border-zinc-800 dark:bg-zinc-900">
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-500" />
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-600" />
        <span className="ml-2 text-xs font-semibold text-zinc-500">terminal — ask-my-journal console</span>
      </div>
      <div
        ref={boxRef}
        onClick={() => inputRef.current?.focus()}
        className="h-64 cursor-text overflow-y-auto bg-zinc-950 p-4 font-mono text-xs leading-relaxed text-zinc-100"
      >
        {lines.map((l, i) => (
          <div key={i} className="whitespace-pre-wrap break-words">{l}</div>
        ))}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(value);
            setValue("");
          }}
          className="mt-1 flex items-center gap-2"
        >
          <span className="shrink-0 text-zinc-400">{PROMPT}</span>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={busy}
            autoComplete="off"
            spellCheck={false}
            aria-label="Terminal input"
            className="w-full bg-transparent outline-none placeholder:text-zinc-600"
            placeholder="help"
          />
        </form>
      </div>
    </section>
  );
}
