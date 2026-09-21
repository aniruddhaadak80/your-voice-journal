import { NextResponse } from "next/server";
import { chatComplete, aiConfigured } from "@/lib/ai";
import { fulltextSearchEntries } from "@/lib/db";
import { requireUserId } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!aiConfigured()) return NextResponse.json({ error: "AI not configured" }, { status: 400 });
  let userId: string;
  try {
    userId = await requireUserId();
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
  const body = (await req.json()) as {
    mode: "summarize" | "tags" | "ask" | "title" | "mood";
    text?: string;
    query?: string;
    deep?: boolean;
  };
  try {
    if (body.mode === "summarize") {
      const out = await chatComplete({
        system: "Summarize the journal entry in 3 crisp bullets plus a one-line mood note.",
        user: (body.text ?? "").slice(0, 12000),
      });
      return NextResponse.json({ result: out });
    }
    if (body.mode === "tags") {
      const out = await chatComplete({
        system: "Suggest up to 6 short lowercase tags, comma-separated, no explanations.",
        user: (body.text ?? "").slice(0, 8000),
      });
      return NextResponse.json({ result: out });
    }
    if (body.mode === "title") {
      const out = await chatComplete({
        system: "Write a 6-words-or-fewer journal title. No quotes, no punctuation fuss, no explanations.",
        user: (body.text ?? "").slice(0, 8000),
      });
      return NextResponse.json({ result: out });
    }
    if (body.mode === "mood") {
      const out = await chatComplete({
        system: "Reply with exactly one word: the dominant mood (lowercase, e.g. calm, excited, nostalgic). Nothing else.",
        user: (body.text ?? "").slice(0, 8000),
      });
      return NextResponse.json({ result: out });
    }
    // ask-my-journal: retrieve top entries then answer grounded.
    // deep=true: Gemini first expands the question into search keywords,
    // each term retrieves, results are merged + deduped before answering.
    const entries = await fulltextSearchEntries({ userId, query: body.query ?? "", limit: 6 });
    if (body.deep && (body.query ?? "").trim()) {
      const expansion = await chatComplete({
        system: "Rewrite the question as 6 comma-separated search keywords (synonyms + related terms). Keywords only.",
        user: (body.query ?? "").slice(0, 500),
      });
      const terms = expansion.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 6);
      const seen = new Set(entries.map((e) => e.id));
      for (const term of terms) {
        const hits = await fulltextSearchEntries({ userId, query: term, limit: 4 });
        for (const h of hits) {
          if (!seen.has(h.id)) {
            seen.add(h.id);
            entries.push(h);
          }
        }
        if (entries.length >= 12) break;
      }
    }
    const context = entries
      .map((e) => `### ${e.title} (${e.createdAt.toISOString().slice(0, 10)})\n${e.plainText.slice(0, 2000)}`)
      .join("\n\n");
    const out = await chatComplete({
      system: "Answer using only the journal context below. Cite entry titles and dates. If unknown, say so.",
      user: `Question: ${body.query}\n\nContext:\n${context}`,
    });
    return NextResponse.json({ result: out, sources: entries.map((e) => ({ id: e.id, title: e.title })) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
