import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { dbConfigured } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { stripHtml } from "@/lib/format";

export const runtime = "nodejs";

export async function GET(req: Request) {
  if (!dbConfigured()) {
    return NextResponse.json({ error: "Database not connected — finish /connect first" }, { status: 400 });
  }
  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") ?? "json";
  let userId: string;
  try {
    userId = await requireUserId();
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
  let entries;
  try {
    entries = await prisma.journalEntry.findMany({
      where: { userId, isDeleted: false },
      include: { attachments: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message.split("\n")[0] }, { status: 500 });
  }
  if (format === "markdown") {
    const md = entries
      .map(
        (e) =>
          `# ${e.title}\n\n_${e.createdAt.toISOString()}_ · tags: ${e.tags.join(", ")}\n\n${stripHtml(e.content)}\n\n${e.transcript ? `> Transcript: ${e.transcript}\n\n` : ""}${e.attachments.map((a) => `- [${a.fileName}](${a.url})`).join("\n")}\n\n---\n`
      )
      .join("\n");
    return new NextResponse(md, {
      headers: { "Content-Type": "text/markdown", "Content-Disposition": "attachment; filename=journal.md" },
    });
  }
  return new NextResponse(JSON.stringify(entries, null, 2), {
    headers: { "Content-Type": "application/json", "Content-Disposition": "attachment; filename=journal.json" },
  });
}
