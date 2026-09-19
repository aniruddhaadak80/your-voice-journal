# Page dependency trees — your-voice-journal

(`@/` = `src/`. Only local/UI imports traced; node_modules skipped.)

## / (Home / Journal)

Entry: `src/app/page.tsx`
Dependencies:
- `src/components/EntryList.tsx` (EntryCard, SearchBar)
  - `src/components/ui.tsx` (Badge, Card)
  - `src/lib/format.ts` (formatDateTime, snippetOf, timeAgo, cn)
  - framer-motion (motion.div stagger)
- `src/components/ui.tsx` (Button)
- `src/components/AskJournal.tsx`
  - lucide-react (Sparkles)
- `src/components/ConnectBanner.tsx`
- `src/app/layout.tsx` → `src/components/Nav.tsx` → `src/components/ThemeToggle.tsx`

## /entry/new

Entry: `src/app/entry/new/page.tsx`
Dependencies:
- `src/components/NewEntryForm.tsx`
  - `src/components/Editor.tsx` (dynamic, ssr:false; TipTap StarterKit/Image/Link/Placeholder)
  - `src/components/VoiceRecorder.tsx` → `src/components/ui.tsx` (Button)
  - `src/components/UploadZone.tsx`
  - `src/components/ui.tsx` (Button, Field, inputCls)
  - `src/actions/entries.ts` (createEntryAction)

## /entry/[id]

Entry: `src/app/entry/[id]/page.tsx`
Dependencies:
- `src/components/ui.tsx` (Badge, Card)
- `src/components/AttachmentGallery.tsx`
- `src/components/EditEntryForm.tsx`
  - (same family as NewEntryForm: Editor, VoiceRecorder, UploadZone, ui)
- `src/components/ConnectBanner.tsx`
- `src/lib/format.ts`

## /connect

Entry: `src/app/connect/page.tsx`
Dependencies:
- `src/components/ui.tsx` (Card)
- `src/components/ConnectTester.tsx` (ConnectTester, EnvGenerator)
- lucide-react (ExternalLink)

## /settings

Entry: `src/app/settings/page.tsx`
Dependencies:
- `src/components/ui.tsx` (Card)
- `src/components/ExportButtons.tsx`
- `src/lib/db.ts`, `src/lib/auth.ts`, `src/lib/s3.ts`, `src/lib/ai.ts` (status checks)

## /sign-in, /sign-up

Entries: `src/app/sign-in/[[...sign-in]]/page.tsx`, `src/app/sign-up/[[...sign-up]]/page.tsx`
Dependencies:
- `@clerk/nextjs` (SignIn / SignUp)
- `src/components/ui.tsx` (Card, fallback only)
