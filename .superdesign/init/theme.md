# Theme — your-voice-journal

## Part 1 — Compact token summary

- **Framework**: Tailwind CSS v4, CSS-first config (no `tailwind.config.*`). Dark mode via custom variant: `@custom-variant dark (&:where(.dark, .dark *));` toggled by adding `.dark` to `<html>`.
- **Palette**: indigo primary (`indigo-600` buttons/links, `indigo-100` badges, `indigo-50/60` AI panel, dark variants `indigo-900/40`, `indigo-950/30`); zinc neutrals (`zinc-50` page bg / `zinc-950` dark, `zinc-200/800` borders, `zinc-500` muted text, `zinc-600/300` secondary text); red-600 danger; white/80 + backdrop-blur cards.
- **Type**: Inter (`next/font/google`, latin subset) for everything; prose content rendered as HTML. Display scale in use: `text-3xl font-bold tracking-tight` (page titles), `text-2xl` (section), `text-xl` (card titles), `text-sm` body, `text-xs` muted/meta. Emoji used as mood glyphs.
- **Radius**: `--radius: 1rem`; components use `rounded-xl` (buttons/inputs/nav) and `rounded-2xl` (cards/panels/editor).
- **Elevation**: `shadow` on primary buttons, `shadow-sm` on cards, `hover:shadow-md hover:-translate-y-0.5` on entry cards; `backdrop-blur` on cards + sticky nav (`bg-white/80`, `dark:bg-zinc-950/80`).
- **Motion**: framer-motion entry cards (`opacity 0→1, y 12→0`, stagger `min(index*0.04, 0.4)`); `transition active:scale-[0.98]` buttons; `animate-pulse` skeletons (`h-32 rounded-2xl bg-zinc-200 dark:bg-zinc-800`).
- **Layout**: centered `max-w-5xl` column, `px-4 py-8`; grids `sm:grid-cols-2`, `md:grid-cols-2`; `line-clamp-3` snippets.
- **Breakpoints**: Tailwind defaults (`sm:`, `md:` used). `scroll-behavior: smooth`.

## Part 2 — Raw source dumps

Full `src/app/globals.css`:

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));;

:root {
  --radius: 1rem;
}

html {
  scroll-behavior: smooth;
}

.prose img {
  border-radius: 1rem;
}
```

Notes: no `tailwind.config.*` exists (v4 CSS-first). No custom font files in repo (Inter loaded via `next/font`). No theme provider component (ThemeToggle flips the class directly). Brand accent = indigo-600 (`#4f46e5` scale) + app name from `NEXT_PUBLIC_APP_NAME`.
