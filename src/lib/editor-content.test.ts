import { describe, it, expect } from "vitest";
import { needsEditorSync, syncEditorContent } from "@/lib/editor-content";

function fakeEditor(initialHtml: string) {
  const state = { html: initialHtml };
  const writes: string[] = [];
  return {
    state,
    writes,
    getHtml: () => state.html,
    setContent: (html: string) => {
      writes.push(html);
      state.html = html;
    },
  };
}

describe("editor content sync", () => {
  it("does not sync without an incoming value", () => {
    const editor = fakeEditor("<p>a</p>");
    expect(needsEditorSync({ incoming: undefined, lastEmitted: null, ...editor })).toBe(false);
  });

  it("does not resync the value the editor itself produced", () => {
    const editor = fakeEditor("<p>hello</p>");
    expect(needsEditorSync({ incoming: "<p>hello</p>", lastEmitted: "<p>hello</p>", ...editor })).toBe(false);
  });

  it("does not sync when the document already matches", () => {
    const editor = fakeEditor("<p>same</p>");
    expect(needsEditorSync({ incoming: "<p>same</p>", lastEmitted: null, ...editor })).toBe(false);
  });

  it("syncs externally added content into the document", () => {
    const editor = fakeEditor("<p>hello</p>");
    const applied = syncEditorContent({
      incoming: '<p>hello</p><p><a href="/u">/u</a></p>',
      lastEmitted: "<p>hello</p>",
      ...editor,
    });
    expect(applied).toBe(true);
    expect(editor.writes).toEqual(['<p>hello</p><p><a href="/u">/u</a></p>']);
    expect(editor.state.html).toBe('<p>hello</p><p><a href="/u">/u</a></p>');
  });

  it("leaves the document untouched when nothing changed", () => {
    const editor = fakeEditor("<p>hello</p>");
    expect(syncEditorContent({ incoming: "<p>hello</p>", lastEmitted: "<p>hello</p>", ...editor })).toBe(false);
    expect(editor.writes).toHaveLength(0);
  });
});
