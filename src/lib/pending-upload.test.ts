import { describe, it, expect, vi, beforeEach } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    user: { findUnique: vi.fn(), create: vi.fn() },
    journalEntry: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    attachment: { create: vi.fn(), updateMany: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ default: prismaMock, prisma: prismaMock }));

import {
  PENDING_UPLOAD_TITLE,
  adoptPendingUploads,
  getOrCreatePendingUploadEntry,
} from "@/lib/db";

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.user.findUnique.mockResolvedValue({ id: "user-1" });
  prismaMock.$transaction.mockImplementation(async (ops: unknown[]) => ops);
});

describe("pending upload holder", () => {
  it("parks uploads on a hidden holder instead of a visible journal entry", async () => {
    prismaMock.journalEntry.findFirst.mockResolvedValue(null);
    prismaMock.journalEntry.create.mockResolvedValue({ id: "holder-1" });

    const id = await getOrCreatePendingUploadEntry("user-1");

    expect(id).toBe("holder-1");
    const createArg = prismaMock.journalEntry.create.mock.calls[0][0];
    // The holder must never surface in /journal, search or exports.
    expect(createArg.data.isDeleted).toBe(true);
    expect(createArg.data.title).toBe(PENDING_UPLOAD_TITLE);
    // ...and it must not look like a normal entry either.
    expect(createArg.data.title).not.toBe("Untitled");
    expect(createArg.data.content).toBe("");
    expect(createArg.data.plainText).toBe("");
  });

  it("creates the User row before the holder so the foreign key holds", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.journalEntry.findFirst.mockResolvedValue(null);
    prismaMock.journalEntry.create.mockResolvedValue({ id: "holder-1" });

    await getOrCreatePendingUploadEntry("clerk-user");

    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: { id: "clerk-user", email: "clerk-user@clerk.users", name: "Journal Owner" },
    });
    expect(prismaMock.user.create.mock.invocationCallOrder[0]).toBeLessThan(
      prismaMock.journalEntry.create.mock.invocationCallOrder[0],
    );
  });

  it("reuses an existing holder instead of creating another one", async () => {
    prismaMock.journalEntry.findFirst.mockResolvedValue({ id: "holder-1" });

    const id = await getOrCreatePendingUploadEntry("user-1");

    expect(id).toBe("holder-1");
    expect(prismaMock.journalEntry.create).not.toHaveBeenCalled();
    expect(prismaMock.journalEntry.findFirst).toHaveBeenCalledWith({
      where: { userId: "user-1", title: PENDING_UPLOAD_TITLE, isDeleted: true },
      orderBy: { createdAt: "desc" },
    });
  });

  it("moves the attachments onto the saved entry and removes the holder", async () => {
    prismaMock.journalEntry.findMany.mockResolvedValue([{ id: "holder-1" }]);

    const adopted = await adoptPendingUploads("user-1", "entry-9");

    expect(adopted).toBe(1);
    expect(prismaMock.attachment.updateMany).toHaveBeenCalledWith({
      where: { entryId: { in: ["holder-1"] } },
      data: { entryId: "entry-9" },
    });
    expect(prismaMock.journalEntry.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ["holder-1"] } },
    });
    // Both writes must happen in one transaction so the attachments are never
    // orphaned by the cascade.
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
  });

  it("does nothing when there is no pending upload", async () => {
    prismaMock.journalEntry.findMany.mockResolvedValue([]);

    const adopted = await adoptPendingUploads("user-1", "entry-9");

    expect(adopted).toBe(0);
    expect(prismaMock.attachment.updateMany).not.toHaveBeenCalled();
    expect(prismaMock.journalEntry.deleteMany).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("never adopts a real entry the user saved", async () => {
    // Only soft-deleted rows with the reserved title are holders.
    prismaMock.journalEntry.findMany.mockResolvedValue([]);

    await adoptPendingUploads("user-1", "entry-9");

    const where = prismaMock.journalEntry.findMany.mock.calls[0][0].where;
    expect(where).toEqual({ userId: "user-1", title: PENDING_UPLOAD_TITLE, isDeleted: true });
  });
});
