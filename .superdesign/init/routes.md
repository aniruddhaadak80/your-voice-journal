# Routes — your-voice-journal (Next.js App Router, file-based)

Layout: `src/app/layout.tsx` (Nav + max-w-5xl main + footer) wraps everything.

| URL | File | What it renders |
|-----|------|-----------------|
| `/` | `src/app/page.tsx` (force-dynamic) | "Your journal" header + New entry button, SearchBar (`?q=`), AskJournal AI panel, Suspense entry list (EntryCard × N, cursor pagination) |
| `/entry/new` | `src/app/entry/new/page.tsx` | "New entry" header + NewEntryForm (TipTap editor, voice recorder, uploads, tags/mood, AI tag/summary buttons) |
| `/entry/[id]` | `src/app/entry/[id]/page.tsx` (force-dynamic) | Title/date/tags header, content Card (prose HTML + transcript `<details>` + audio), AttachmentGallery, Edit section (EditEntryForm) |
| `/connect` | `src/app/connect/page.tsx` (static) | "Connect your own backends 🔌" + 4 Step cards (Neon, R2/S3, Gemini, Clerk) + ConnectTester + EnvGenerator + Vercel deploy card |
| `/settings` | `src/app/settings/page.tsx` (force-dynamic) | "Settings & status" + 5 status Cards (Neon Postgres 🟢/🟡/🔴, S3/R2, Gemini AI, Clerk auth, Export w/ ExportButtons) |
| `/sign-in/[[...sign-in]]` | `src/app/sign-in/[[...sign-in]]/page.tsx` | Clerk `<SignIn>` path-routed form (or "Auth not configured" fallback) |
| `/sign-up/[[...sign-up]]` | `src/app/sign-up/[[...sign-up]]/page.tsx` | Clerk `<SignUp>` path-routed form (or fallback) |

API routes (not design targets, listed for context): `/api/ai`, `/api/connect/test`, `/api/export`, `/api/status`, `/api/transcribe`, `/api/upload`.
