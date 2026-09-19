# Design System — Your Voice Journal (+ Showcase experiences)

## Product context

Your Voice Journal is a Next.js 15 AI voice + multimedia journal: Neon Postgres stores entries,
S3/R2 holds media, Gemini transcribes + answers "Ask my journal", Clerk isolates per-user data.
Key pages: `/` journal home (search + AI panel + entry cards), `/entry/new` (TipTap editor +
voice recorder + uploads), `/entry/[id]` (prose + transcript + gallery + edit), `/connect`
(backend wizard), `/settings` (status cards), `/showcase` (full-screen immersive experiences:
Kage temple, Sketchbook — plus the new third experience designed here).

## Brand & visual language (HARD CONSTRAINT for all generations)

- **Fonts**: Inter ONLY (loaded via `next/font`). No serif/display/decorative fonts in app UI.
  (The two embedded showcase documents keep their own authored fonts; app chrome stays Inter.)
- **Colors**: zinc neutrals + indigo-600 primary. Page bg `zinc-50` / `text-zinc-900`
  (dark: `bg-zinc-950` / `text-zinc-100`). Borders `zinc-200`/`zinc-800`. Muted text `zinc-500`.
  Primary actions `bg-indigo-600 text-white hover:bg-indigo-500`. Badges `bg-indigo-100 text-indigo-700`.
  AI surfaces use indigo tints (`border-indigo-200 bg-indigo-50/60`). Danger `red-600`. NOTHING else —
  no pink, neon, purple gradients, no invented accent colors.
- **Shape**: `rounded-xl` buttons/inputs/nav pills, `rounded-2xl` cards/panels. `--radius: 1rem`.
- **Elevation**: `shadow` on primary buttons, `shadow-sm` on cards, `backdrop-blur` + `bg-white/80`
  on cards and sticky nav. Entry cards lift on hover (`hover:shadow-md hover:-translate-y-0.5`).
- **Shell**: sticky blurred top nav (brand left: book icon + app name; links Journal/New/Connect/
  Showcase/Settings; Sign in primary + Sign up ghost + UserButton; theme toggle), centered
  `max-w-5xl` column, small muted footer. Dark mode = `.dark` class on `<html>`.
- **Motion**: subtle only — fade/slide-in entry cards (stagger ≤0.4s), `active:scale-[0.98]`
  button press, `animate-pulse` skeletons. No gratuitous animation.

## Third-experience direction (this draft)

A monochrome black-and-white "studio OS" full-screen experience for the journal — the missing
third showcase world alongside the ember temple (Kage) and the paper sketchbook. Vocabulary:
modular project cells, floating utility dock, diagnostics strip, terminal-like close. Content stays
journal-native: entries as cells, voice/transcription stats as diagnostics, Ask-my-journal as the
terminal. Strictly black/white/gray; Inter only; terminal monospace accents allowed ONLY inside
the terminal module. Must feel like a tactile operating system, not a marketing page.
