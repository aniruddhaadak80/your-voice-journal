import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Nav from "@/components/Nav";
import { clerkConfigured } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"] });

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://your-voice-journal.vercel.app";
const SITE_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Your Voice Journal";
const SITE_DESC =
  "AI voice + multimedia journal backed by your own Neon Postgres + S3/R2.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  description: SITE_DESC,
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESC,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: SITE_NAME,
    description: SITE_DESC,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const content = (
    <>
      <Nav />
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      <footer className="mx-auto max-w-5xl px-4 pb-10 text-xs text-zinc-500">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span>Your data lives in your Neon Postgres + object storage. No vendor lock-in.</span>
          <span className="ml-auto flex gap-3">
            <a href="/showcase" className="hover:underline">Showcase</a>
            <a href="/connect" className="hover:underline">Connect</a>
            <a href="/api/status" className="hover:underline">Status</a>
            <a href="https://github.com/aniruddhaadak80/your-voice-journal" target="_blank" className="hover:underline">GitHub</a>
          </span>
        </div>
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
