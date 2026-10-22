"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useRef } from "react";
import { syncEditorContent } from "@/lib/editor-content";

export default function Editor({
  initial,
  onChange,
}: {
  initial?: string;
  onChange: (html: string) => void;
}) {
  // Last HTML the editor reported through onUpdate. Used to tell an
  // external change (e.g. an uploaded file link) apart from an echo of the
  // editor's own state.
  const lastEmitted = useRef<string | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Write your mind… (markdown shortcuts work)" }),
    ],
    content: initial || "",
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert min-h-[280px] max-w-none rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 outline-none focus:ring-2 focus:ring-blue-200",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      lastEmitted.current = html;
      onChange(html);
    },
  });

  // TipTap only reads `content` when the editor is created, so content that
  // changes from the outside (for example the link added by the upload zone)
  // has to be pushed into the document explicitly. Without this the change is
  // invisible in the editor and is overwritten by the next onUpdate.
  useEffect(() => {
    if (!editor) return;
    syncEditorContent({
      incoming: initial,
      lastEmitted: lastEmitted.current,
      getHtml: () => editor.getHTML(),
      setContent: (html) => {
        editor.commands.setContent(html, false);
      },
    });
  }, [editor, initial]);

  if (!editor) return <div className="animate-pulse rounded-2xl border p-4">Loading editor…</div>;

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-1 text-sm">
        {(
          [
            ["B", () => editor.chain().focus().toggleBold().run(), editor.isActive("bold")],
            ["I", () => editor.chain().focus().toggleItalic().run(), editor.isActive("italic")],
            ["H1", () => editor.chain().focus().toggleHeading({ level: 1 }).run(), editor.isActive("heading", { level: 1 })],
            ["H2", () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive("heading", { level: 2 })],
            ["• List", () => editor.chain().focus().toggleBulletList().run(), editor.isActive("bulletList")],
            ["1. List", () => editor.chain().focus().toggleOrderedList().run(), editor.isActive("orderedList")],
            ["Quote", () => editor.chain().focus().toggleBlockquote().run(), editor.isActive("blockquote")],
            ["Code", () => editor.chain().focus().toggleCodeBlock().run(), editor.isActive("codeBlock")],
          ] as Array<[string, () => void, boolean]>
        ).map(([label, fn, active]) => (
          <button
            key={label}
            type="button"
            onClick={fn}
            className={`rounded-lg px-2.5 py-1.5 font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 ${active ? "bg-blue-100 text-blue-700 dark:bg-blue-900" : "text-zinc-600 dark:text-zinc-300"}`}
          >
            {label}
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
