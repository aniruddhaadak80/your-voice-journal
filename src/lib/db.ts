import prisma from "./prisma";

export function defaultUserId() {
  return process.env.DEFAULT_USER_ID ?? "demo-user";
}

export async function ensureDemoUser() {
  const id = defaultUserId();
  const email = process.env.DEFAULT_USER_EMAIL ?? "you@example.com";
  return prisma.user.upsert({
    where: { id },
    update: {},
    create: { id, email, name: "Journal Owner" },
  });
}

export type EntryFilter = {
  userId: string;
  limit?: number;
  cursor?: string;
  search?: string;
  tag?: string;
  includeDeleted?: boolean;
};

function searchWhere(search?: string) {
  if (!search?.trim()) return {};
  const q = search.trim();
  return {
    OR: [
      { title: { contains: q, mode: "insensitive" as const } },
      { plainText: { contains: q, mode: "insensitive" as const } },
      { transcript: { contains: q, mode: "insensitive" as const } },
      { tags: { has: q } },
    ],
  };
}

export async function fulltextSearchEntries(params: {
  userId: string;
  query: string;
  limit?: number;
}) {
  const { userId, query, limit = 20 } = params;
  const q = query.trim();
  if (!q) return [];
  // Portable ILIKE search. For large DBs add a tsvector migration
  // (see prisma/migrations/*_fulltext.sql) for tsvector ranking.
  return prisma.journalEntry.findMany({
    where: {
      userId,
      isDeleted: false,
      ...searchWhere(q),
    },
    include: { attachments: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getEntries({ userId, limit = 20, cursor, search, tag }: EntryFilter) {
  return prisma.journalEntry.findMany({
    where: {
      userId,
      isDeleted: false,
      ...(tag ? { tags: { has: tag } } : {}),
      ...searchWhere(search),
    },
    include: { attachments: true },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });
}

export async function getEntryById({ id, userId }: { id: string; userId: string }) {
  return prisma.journalEntry.findFirst({
    where: { id, userId, isDeleted: false },
    include: { attachments: { orderBy: { createdAt: "asc" } } },
  });
}

export async function createEntry(input: {
  userId: string;
  title?: string;
  content?: string;
  plainText?: string;
  transcript?: string;
  tags?: string[];
  mood?: string;
  audioUrl?: string;
}) {
  await ensureDemoUserIfNeeded(input.userId);
  return prisma.journalEntry.create({
    data: {
      userId: input.userId,
      title: input.title?.trim() || "Untitled",
      content: input.content ?? "",
      plainText: input.plainText ?? "",
      transcript: input.transcript ?? "",
      tags: input.tags ?? [],
      mood: input.mood,
      audioUrl: input.audioUrl,
    },
  });
}

export async function updateEntry(input: {
  id: string;
  userId: string;
  title?: string;
  content?: string;
  plainText?: string;
  transcript?: string;
  tags?: string[];
  mood?: string;
  audioUrl?: string;
}) {
  const { id, userId, ...data } = input;
  return prisma.journalEntry.updateMany({
    where: { id, userId, isDeleted: false },
    data: {
      ...(data.title !== undefined ? { title: data.title.trim() || "Untitled" } : {}),
      ...(data.content !== undefined ? { content: data.content } : {}),
      ...(data.plainText !== undefined ? { plainText: data.plainText } : {}),
      ...(data.transcript !== undefined ? { transcript: data.transcript } : {}),
      ...(data.tags !== undefined ? { tags: data.tags } : {}),
      ...(data.mood !== undefined ? { mood: data.mood } : {}),
      ...(data.audioUrl !== undefined ? { audioUrl: data.audioUrl } : {}),
    },
  });
}

export async function deleteEntry({ id, userId }: { id: string; userId: string }) {
  return prisma.journalEntry.updateMany({
    where: { id, userId, isDeleted: false },
    data: { isDeleted: true },
  });
}

async function ensureDemoUserIfNeeded(userId: string) {
  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) {
    // Clerk users get a synthetic stable email; demo mode uses your email.
    const email =
      userId === defaultUserId()
        ? (process.env.DEFAULT_USER_EMAIL ?? "you@example.com")
        : `${userId}@clerk.users`;
    await prisma.user.create({
      data: {
        id: userId,
        email,
        name: "Journal Owner",
      },
    });
  }
}

export async function createAttachment(input: {
  entryId: string;
  url: string;
  type: "image" | "video" | "audio" | "pdf" | "document" | "other";
  fileName: string;
  mimeType?: string;
  sizeBytes?: number;
}) {
  return prisma.attachment.create({ data: input });
}

export async function getAttachmentsByEntryId(entryId: string) {
  return prisma.attachment.findMany({
    where: { entryId },
    orderBy: { createdAt: "asc" },
  });
}

export function snippetOf(text: string, max = 180) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? clean.slice(0, max - 1) + "…" : clean;
}

// --- Fail-safe wrappers -----------------------------------------------
// Never throw: pages stay up with a friendly "connect your DB" state
// when DATABASE_URL is missing or the DB is unreachable/unmigrated.

export function dbConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export async function getDbStatus(): Promise<{ ok: boolean; error?: string }> {
  if (!dbConfigured()) return { ok: false, error: "DATABASE_URL is not set" };
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message.split("\n")[0] };
  }
}

export async function tryGetEntries(filter: EntryFilter) {
  const status = await getDbStatus();
  if (!status.ok) return { entries: [] as Awaited<ReturnType<typeof getEntries>>, dbOk: false as const, error: status.error };
  try {
    const entries = await getEntries(filter);
    return { entries, dbOk: true as const, error: undefined as string | undefined };
  } catch (e) {
    return { entries: [] as Awaited<ReturnType<typeof getEntries>>, dbOk: false as const, error: (e as Error).message.split("\n")[0] };
  }
}

export async function trySearchEntries(params: { userId: string; query: string; limit?: number }) {
  const status = await getDbStatus();
  if (!status.ok) return { entries: [] as Awaited<ReturnType<typeof fulltextSearchEntries>>, dbOk: false as const, error: status.error };
  try {
    const entries = await fulltextSearchEntries(params);
    return { entries, dbOk: true as const, error: undefined as string | undefined };
  } catch (e) {
    return { entries: [] as Awaited<ReturnType<typeof fulltextSearchEntries>>, dbOk: false as const, error: (e as Error).message.split("\n")[0] };
  }
}

export async function tryGetEntryById(params: { id: string; userId: string }) {
  const status = await getDbStatus();
  if (!status.ok) return { entry: null, dbOk: false as const, error: status.error };
  try {
    const entry = await getEntryById(params);
    return { entry, dbOk: true as const, error: undefined as string | undefined };
  } catch (e) {
    return { entry: null, dbOk: false as const, error: (e as Error).message.split("\n")[0] };
  }
}
