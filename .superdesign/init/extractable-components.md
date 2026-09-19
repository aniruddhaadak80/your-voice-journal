# Extractable components — your-voice-journal

## NavBar
- Source: `src/components/Nav.tsx`
- Category: layout
- Description: Sticky blurred top bar with brand, 4 section links, Clerk auth buttons, theme toggle
- Extractable props: activeItem (string, default: "/"), appName (string, default: "Your Voice Journal"), clerkOn (boolean, default: true)
- Hardcoded: BookOpenText/Plus/Search/Settings/PlugZap icons, link labels + hrefs, Sign in/Sign up button styles, all CSS

## ThemeToggle
- Source: `src/components/ThemeToggle.tsx`
- Category: basic
- Description: Moon/sun button flipping `.dark` on `<html>`
- Extractable props: none (self-contained)
- Hardcoded: Moon/Sun icons, button CSS

## EntryCard
- Source: `src/components/EntryList.tsx`
- Category: basic
- Description: Journal preview card — title, date/relative time, mood emoji, 3-line snippet, tag badges, attachment/audio markers, stagger-in motion
- Extractable props: entry (object), index (number, default: 0)
- Hardcoded: date format, snippet length, max 6 tags, 📎/🎙️ markers, motion values, Card/Badge styles

## SearchBar
- Source: `src/components/EntryList.tsx`
- Category: basic
- Description: Search input + button syncing `?q=` via GET form
- Extractable props: defaultValue (string, default: "")
- Hardcoded: placeholder text, input/button CSS, form action "/"

## AskPanel
- Source: `src/components/AskJournal.tsx`
- Category: basic
- Description: Indigo AI panel with Sparkles header, question input, Ask button, answer area
- Extractable props: none (self-contained, calls `/api/ai`)
- Hardcoded: "Ask my journal (AI + full-text retrieval)" header, placeholder, indigo panel CSS

## VoiceRecorder
- Source: `src/components/VoiceRecorder.tsx`
- Category: basic
- Description: Record voice → transcribe → callback; record/stop/transcribing states + error line
- Extractable props: onTranscribed (callback)
- Hardcoded: Mic/Square/Loader2 icons, "Record voice"/"Transcribing…"/"Microphone permission denied." strings, Button variants

## UploadZone
- Source: `src/components/UploadZone.tsx`
- Category: basic
- Description: Dashed drag/click file drop with status message
- Extractable props: entryId (string, optional), onUploaded (callback)
- Hardcoded: UploadCloud icon, "Drop images, video, audio, PDFs here or click to browse", dashed-border CSS

## Button
- Source: `src/components/ui.tsx`
- Category: basic
- Description: Primary/secondary/ghost/danger pill button with press-down micro-interaction
- Extractable props: variant ("primary" | "secondary" | "ghost" | "danger", default: "primary"), label/children
- Hardcoded: rounded-xl, padding, indigo/zinc/red fills, all CSS

## Card
- Source: `src/components/ui.tsx`
- Category: basic
- Description: Frosted rounded panel used for every content block
- Extractable props: children, className passthrough
- Hardcoded: rounded-2xl, border, bg-white/80 blur, shadow-sm, dark variant

## TagBadge
- Source: `src/components/ui.tsx` (Badge)
- Category: basic
- Description: Pill tag with `#` prefix
- Extractable props: label (children)
- Hardcoded: `#` prefix, indigo-100 pill CSS

## AttachmentGallery
- Source: `src/components/AttachmentGallery.tsx`
- Category: basic
- Description: 2-col grid rendering image/video/audio/file attachments with filename footers
- Extractable props: items (Attachment[])
- Hardcoded: grid layout, player attributes, 📄 file row, card CSS

## RichEditor
- Source: `src/components/Editor.tsx`
- Category: basic
- Description: TipTap editor with B/I/H1/H2/list/quote/code toolbar and placeholder
- Extractable props: initial (string), onChange (callback)
- Hardcoded: toolbar labels, "Write your mind… (markdown shortcuts work)" placeholder, min-h-[280px] editor CSS
