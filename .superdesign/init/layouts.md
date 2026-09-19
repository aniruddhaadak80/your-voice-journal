# Layouts — your-voice-journal

## Root layout (`src/app/layout.tsx`)

Renders `<Nav />`, centered `max-w-5xl` main, footer. Wraps in ClerkProvider only when Clerk keys exist; Inter font; light default with `.dark` class support.

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Nav from "@/components/Nav";
import { clerkConfigured } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || "Your Voice Journal",
  description: "AI voice + multimedia journal backed by your own Neon Postgres + S3/R2.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const content = (
    <>
      <Nav />
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      <footer className="mx-auto max-w-5xl px-4 pb-10 text-xs text-zinc-500">
        Your data lives in your Neon Postgres + object storage. No vendor lock-in.
      </footer>
    </>
  );
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 antialiased`}>
        {clerkConfigured() ? <ClerkProvider>{content}</ClerkProvider> : content}
      </body>
    </html>
  );
}
```

## Nav (`src/components/Nav.tsx`, client)

Sticky blurred top bar: brand (BookOpenText icon + app name) left; Journal / New / Connect / Settings links with active-pill state; Sign in (primary) + Sign up (ghost) + UserButton when `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` set; ThemeToggle right.

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenText, Plus, Search, Settings, PlugZap } from "lucide-react";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/format";
import ThemeToggle from "./ThemeToggle";

const clerkOn = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function Nav() {
  const path = usePathname();
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "Your Voice Journal";
  const link = (href: string, label: string, icon: React.ReactNode) => (
    <Link
      key={href}
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition hover:bg-zinc-100 dark:hover:bg-zinc-800",
        path === href ? "bg-zinc-100 dark:bg-zinc-800" : "text-zinc-600 dark:text-zinc-300"
      )}
    >
      {icon}
      {label}
    </Link>
  );
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <BookOpenText className="h-5 w-5 text-indigo-600" />
          {appName}
        </Link>
        <nav className="flex items-center gap-1">
          {link("/", "Journal", <Search className="h-4 w-4" />)}
          {link("/entry/new", "New", <Plus className="h-4 w-4" />)}
          {link("/connect", "Connect", <PlugZap className="h-4 w-4" />)}
          {link("/settings", "Settings", <Settings className="h-4 w-4" />)}
          {clerkOn && (
            <>
              <SignInButton mode="modal">
                <button className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="rounded-xl px-3 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">
                  Sign up
                </button>
              </SignUpButton>
              <UserButton />
            </>
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
```

## Middleware (`src/middleware.ts`)

`clerkMiddleware()` when the publishable key exists, else pass-through (demo mode). Matcher covers all app/API routes plus `/__clerk/:path*`, excluding `_next` static and file assets.

## Auth pages

- `src/app/sign-in/[[...sign-in]]/page.tsx` — renders `<SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />` centered (`flex justify-center py-10`); fallback "Auth not configured" Card linking to `/connect` when keys missing.
- `src/app/sign-up/[[...sign-up]]/page.tsx` — mirror with `<SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />`.
