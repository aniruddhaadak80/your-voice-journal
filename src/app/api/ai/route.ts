import { NextResponse } from "next/server";
import { chatComplete, aiConfigured } from "@/lib/ai";
import { defaultUserId, fulltextSearchEntries } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!aiConfigured()) return NextResponse.json({ error: "AI not configured" }, { status: 400 });
  const body = (await req.json()) as { mode: "summarize" | "tags" | "ask"; text?: string; query?: string };
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
    // ask-my-journal: retrieve top entries then answer grounded
    const entries = await fulltextSearchEntries({
      userId: defaultUserId(),
      query: body.query ?? "",
      limit: 6,
    });
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
