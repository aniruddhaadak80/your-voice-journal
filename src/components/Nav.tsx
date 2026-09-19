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
