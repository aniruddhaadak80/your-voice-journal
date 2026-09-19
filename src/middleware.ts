import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const useClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

// Without Clerk keys the middleware is a no-op so the app still runs
// (single-user demo mode). Add keys + redeploy to enable auth.
export default useClerk
  ? clerkMiddleware()
  : function middleware() {
      return NextResponse.next();
    };

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
