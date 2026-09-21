import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const useClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

// Public surface: landing, auth flows, health, SEO files.
// EVERYTHING else requires sign-in (journal, entries, connect,
// settings, showcase, all other APIs).
const PUBLIC_EXACT = new Set([
  "/",
  "/api/status",
  "/sitemap.xml",
  "/robots.txt",
  "/manifest.webmanifest",
]);
const PUBLIC_PREFIXES = ["/sign-in", "/sign-up", "/__clerk"];

function isPublic(pathname: string) {
  if (PUBLIC_EXACT.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

// Without Clerk keys the middleware is a no-op so the app still runs
// (single-user demo mode). Add keys + redeploy to enable the wall.
export default useClerk
  ? clerkMiddleware(async (auth, req) => {
      const pathname = req.nextUrl.pathname;
      const { userId } = await auth();
      // Signed-in visitors skip the marketing landing → straight to journal.
      if (pathname === "/") {
        if (userId) return NextResponse.redirect(new URL("/journal", req.url));
        return NextResponse.next();
      }
      if (isPublic(pathname) || userId) return NextResponse.next();
      // Signed out: pages → sign-in, APIs → 401 JSON.
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Sign in required." }, { status: 401 });
      }
      const signIn = new URL("/sign-in", req.url);
      signIn.searchParams.set("redirect_url", pathname);
      return NextResponse.redirect(signIn);
    })
  : function middleware() {
      return NextResponse.next();
    };

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
