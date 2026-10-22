/**
 * TipTap reads the `content` option only when the editor is created. Anything
 * the parent adds from the outside (for example the link produced by the
 * upload zone) has to be pushed into the document explicitly, otherwise it is
 * invisible in the editor and is overwritten by the next `onUpdate`.
 *
 * The helpers below keep that sync safe:
 *
 * - `lastEmitted` is the HTML the editor last reported through `onUpdate`.
 *   When the incoming value matches it, the change came from the editor
 *   itself and must not be re-applied (that would move the caret on every
 *   keystroke).
 * - `emitUpdate` stays false so TipTap does not fire `onUpdate` for the
 *   programmatic change, which would otherwise bounce the value back to the
 *   parent and create a loop.
 */

export type EditorSyncOptions = {
  /** HTML the parent wants the editor to show. `undefined` means "no opinion". */
  incoming: string | undefined;
  /** Last HTML the editor reported through `onUpdate`. */
  lastEmitted: string | null;
  /** Reads the current document HTML. */
  getHtml: () => string;
  /** Writes HTML into the document. */
  setContent: (html: string) => void;
};

/**
 * Returns true when the incoming HTML has to be written into the editor
 * document. Returns false when nothing needs to happen (no incoming value,
 * the value already matches the document, or the value came from the editor
 * itself).
 */
export function needsEditorSync(options: EditorSyncOptions): boolean {
  if (options.incoming === undefined) return false;
  if (options.incoming === options.lastEmitted) return false;
  if (options.getHtml() === options.incoming) return false;
  return true;
}

/**
 * Pushes externally supplied HTML into the editor document when needed.
 * Returns true when the document was updated.
 */
export function syncEditorContent(options: EditorSyncOptions): boolean {
  if (!needsEditorSync(options)) return false;
  options.setContent(options.incoming as string);
  return true;
}
