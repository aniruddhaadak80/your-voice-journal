"use client";

import Link from "next/link";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { Button } from "./ui";

// True when Clerk keys are present (same check as Nav). When false the app
// runs in single-user demo mode and everything stays open.
export const clerkOn = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

// Rule of hooks helper: call ONLY from components rendered when clerkOn is
// true (i.e. inside ClerkProvider). Pattern per gated component:
//
//   export default function Foo() {
//     if (!clerkOn) return <FooBox />;      // demo mode: open
//     return <GatedFoo />;                  // Clerk: must sign in
//   }
export function useSignInGate() {
  const { isSignedIn, isLoaded } = useAuth();
  return { isSignedIn: isSignedIn ?? false, isLoaded };
}

export function GateLoading() {
  return <p className="text-sm text-zinc-500">Checking sign-in…</p>;
}

// Browsing is free — this wall appears only in front of WRITES
// (chat, saving entries, uploads, connecting keys, export).
export default function RequireSignIn({ action }: { action: string }) {
  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5 dark:border-blue-900 dark:bg-blue-950/30">
      <h3 className="font-semibold text-blue-700 dark:text-blue-300">Sign in to {action}</h3>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
        Browsing is free for everyone. Signing in (Google, LinkedIn, Facebook or email) connects
        your own journal and keys to your account.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <SignInButton mode="modal">
          <Button>Sign in</Button>
        </SignInButton>
        <Link href="/sign-in">
          <Button variant="secondary">Go to sign-in page →</Button>
        </Link>
      </div>
    </div>
  );
}
