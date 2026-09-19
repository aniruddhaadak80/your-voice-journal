"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";

export default function Editor({
  initial,
  onChange,
}: {
  initial?: string;
  onChange: (html: string) => void;
}) {
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
          "prose dark:prose-invert min-h-[280px] max-w-none rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 outline-none focus:ring-2 focus:ring-indigo-200",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (editor && initial !== undefined && editor.getHTML() !== initial) {
      // only set on mount differences
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

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
            className={`rounded-lg px-2.5 py-1.5 font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 ${active ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900" : "text-zinc-600 dark:text-zinc-300"}`}
          >
            {label}
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
