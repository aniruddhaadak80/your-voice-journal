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
  const body = (
    <body className={`${inter.className} bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 antialiased`}>
      <Nav />
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      <footer className="mx-auto max-w-5xl px-4 pb-10 text-xs text-zinc-500">
        Your data lives in your Neon Postgres + object storage. No vendor lock-in.
      </footer>
    </body>
  );
  // ClerkProvider requires keys — only wrap when configured.
  if (!clerkConfigured()) {
    return <html lang="en" suppressHydrationWarning>{body}</html>;
  }
  return (
    <html lang="en" suppressHydrationWarning>
      <ClerkProvider>{body}</ClerkProvider>
    </html>
  );
}
