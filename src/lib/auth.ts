import { auth } from "@clerk/nextjs/server";
import { defaultUserId } from "./db";

// Clerk is optional: when keys are missing the app runs in single-user
// demo mode keyed by DEFAULT_USER_ID. Add keys to enable per-user data.
export function clerkConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
  );
}

export async function getUserId(): Promise<string> {
  if (!clerkConfigured()) return defaultUserId();
  try {
    const { userId } = await auth();
    return userId ?? defaultUserId();
  } catch {
    return defaultUserId();
  }
}

// Email for the Prisma User row. Clerk users get a synthetic stable email
// so the required unique `email` column stays satisfied.
export function emailForUser(userId: string) {
  if (userId === defaultUserId()) {
    return process.env.DEFAULT_USER_EMAIL ?? "you@example.com";
  }
  return `${userId}@clerk.users`;
}
