# Your Voice Journal 🎙️📝

AI-powered, multimedia journaling on **your own Neon Postgres + S3/R2**. Next.js 15 App Router, Gemini voice transcription, rich text, attachments, full-text search, Ask-my-journal.

## Features
- **Voice journaling**: browser recorder → `/api/transcribe` (Gemini BYOK) → transcript + audio URL saved in Postgres
- **Multimedia**: images, video, audio, PDFs, docs via S3-compatible upload (`/api/upload`), gallery rendering
- **Rich text**: TipTap editor (headings, lists, code, links, images)
- **Search**: portable ILIKE search now, optional `tsvector` migration (`prisma/fulltext.sql`)
- **AI**: summarize, suggest tags, Ask-my-journal (retrieval + grounded answer)
- **Modern UI**: Tailwind v4, dark mode, Framer Motion list transitions, skeletons, `loading.tsx`/`error.tsx`, Suspense streaming
- **BYODatabase**: single-user now (`DEFAULT_USER_ID`), all queries take `userId` so NextAuth/Clerk slots in later

## Tech
Next.js 15 · TypeScript · Tailwind · Prisma · Neon Postgres · S3/R2 (`@aws-sdk/client-s3`) · TipTap · Framer Motion · lucide-react

## Setup
1. `npm install --legacy-peer-deps`
2. Copy `.env.example` → `.env`, set `DATABASE_URL` (Neon), `S3_*`, `GEMINI_API_KEY` (optional, free at https://aistudio.google.com/apikey)
3. `npx prisma migrate dev` (creates tables) — optional: `psql $DATABASE_URL -f prisma/fulltext.sql`
4. `npm run db:seed`
5. `npm run dev` → http://localhost:3000

Without env vars the app still runs (empty state); `/settings` shows DB/storage/AI status.

## Neon + R2 quickstart
- **Neon**: neon.tech → New Project → copy connection string (`?sslmode=require`) → `DATABASE_URL`
- **Cloudflare R2**: Dashboard → R2 → bucket `journal-media` → Manage API tokens → `S3_ENDPOINT=https://<account>.r2.cloudflarestorage.com`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_REGION=auto`, `S3_PUBLIC_BASE_URL=https://pub-<id>.r2.dev`
- **AWS S3**: bucket + IAM keys; `S3_ENDPOINT` empty (uses regional endpoint), `S3_PUBLIC_BASE_URL` = CloudFront or leave empty

## Deploy (Vercel)
1. Push repo to GitHub, Import in Vercel
2. Env vars: `DATABASE_URL`, `S3_*`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `NEXT_PUBLIC_APP_NAME`, `DEFAULT_USER_ID`
3. Build: `npx prisma generate && next build` (default `npm run build` + postinstall handles generate — add `"postinstall": "prisma generate"` if needed)
4. After first deploy: `npx prisma migrate deploy` against prod Neon DB

## Scripts
`dev` · `build` · `start` · `lint` · `format` · `test` (`vitest`) · `db:migrate` · `db:seed`

## Adding auth later
All DB helpers accept `userId`; server actions currently use `defaultUserId()`. Replace with `auth()` (NextAuth/Clerk) session id, add `User` relation — no schema change needed.

## Routes
`/` dashboard+search · `/entry/new` create · `/entry/[id]` view/edit · `/settings` status+export · `/api/upload` · `/api/transcribe` · `/api/ai` · `/api/export` · `/api/status`
