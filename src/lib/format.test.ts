import { describe, it, expect } from "vitest";
import { snippetOf } from "@/lib/format";
import { stripHtml, formatDate } from "@/lib/format";

describe("format utils", () => {
  it("snippets long text", () => {
    expect(snippetOf("a ".repeat(200), 50).length).toBeLessThanOrEqual(50);
  });
  it("strips html", () => {
    expect(stripHtml("<h1>Hi</h1><p>there</p>")).toContain("Hi");
  });
  it("formats date", () => {
    expect(formatDate(new Date("2026-01-01"))).toMatch(/2026/);
  });
});
