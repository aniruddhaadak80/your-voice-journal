import { describe, it, expect, vi, beforeEach } from "vitest";

const { dbMock, s3Mock, authMock } = vi.hoisted(() => ({
  dbMock: {
    dbConfigured: vi.fn(() => true),
    getEntryById: vi.fn(),
    createAttachment: vi.fn(),
    getOrCreatePendingUploadEntry: vi.fn(),
  },
  s3Mock: {
    isAllowedMime: vi.fn(() => true),
    classifyMime: vi.fn(() => "image"),
    storageConfigured: vi.fn(() => true),
    uploadBufferToStorage: vi.fn(async () => ({ key: "uploads/x.png", url: "https://cdn.example/x.png" })),
    MAX_UPLOAD_BYTES: 50 * 1024 * 1024,
  },
  authMock: { requireUserId: vi.fn(async () => "user-1") },
}));

vi.mock("@/lib/db", () => dbMock);
vi.mock("@/lib/s3", () => s3Mock);
vi.mock("@/lib/auth", () => authMock);

import { POST } from "@/app/api/upload/route";

function fileForm(extra?: Record<string, string>) {
  const form = new FormData();
  form.append("file", new File([new Uint8Array([1, 2, 3])], "x.png", { type: "image/png" }));
  for (const [k, v] of Object.entries(extra ?? {})) form.append(k, v);
  return form;
}

beforeEach(() => {
  vi.clearAllMocks();
  dbMock.dbConfigured.mockReturnValue(true);
  s3Mock.storageConfigured.mockReturnValue(true);
  s3Mock.isAllowedMime.mockReturnValue(true);
  s3Mock.classifyMime.mockReturnValue("image");
  s3Mock.uploadBufferToStorage.mockResolvedValue({ key: "uploads/x.png", url: "https://cdn.example/x.png" });
  authMock.requireUserId.mockResolvedValue("user-1");
  dbMock.getOrCreatePendingUploadEntry.mockResolvedValue("holder-1");
  dbMock.createAttachment.mockResolvedValue({ id: "att-1" });
  dbMock.getEntryById.mockResolvedValue({ id: "entry-1" });
});

describe("POST /api/upload", () => {
  it("parks an upload made before the entry exists on the hidden holder", async () => {
    const res = await POST({ formData: async () => fileForm() } as unknown as Request);
    expect(res.status).toBe(200);

    // The attachment must not be attached to a user-visible "Untitled" entry,
    // it must land on the hidden pending-upload holder instead.
    expect(dbMock.getOrCreatePendingUploadEntry).toHaveBeenCalledWith("user-1");
    expect(dbMock.createAttachment).toHaveBeenCalledWith(
      expect.objectContaining({ entryId: "holder-1", url: "https://cdn.example/x.png" }),
    );
  });

  it("attaches straight to the entry when an entryId is given", async () => {
    const res = await POST({ formData: async () => fileForm({ entryId: "entry-1" }) } as unknown as Request);
    expect(res.status).toBe(200);

    expect(dbMock.getOrCreatePendingUploadEntry).not.toHaveBeenCalled();
    expect(dbMock.createAttachment).toHaveBeenCalledWith(
      expect.objectContaining({ entryId: "entry-1" }),
    );
  });

  it("rejects an entryId that does not belong to the user", async () => {
    dbMock.getEntryById.mockResolvedValue(null);
    const res = await POST({ formData: async () => fileForm({ entryId: "other-entry" }) } as unknown as Request);
    expect(res.status).toBe(404);
    expect(dbMock.createAttachment).not.toHaveBeenCalled();
  });
});
