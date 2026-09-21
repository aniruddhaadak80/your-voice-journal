"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mic, Sparkles, Search, Images, Lock, Download,
  ArrowRight, Check, Play, Database, Cloud, Cpu,
} from "lucide-react";
import { Button } from "@/components/ui";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
};

function Orbs() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-200/50 blur-3xl dark:bg-blue-950/60"
        animate={{ y: [0, 30, 0], x: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-zinc-300/40 blur-3xl dark:bg-zinc-800/60"
        animate={{ y: [0, -30, 0], x: [0, -20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-blue-100/60 blur-3xl dark:bg-blue-900/30"
        animate={{ y: [0, 24, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

const FEATURES = [
  { icon: Mic, title: "Voice-first capture", text: "Record in the browser — Gemini transcribes, audio lands in your own storage." },
  { icon: Sparkles, title: "Ask my journal", text: "Retrieval-grounded answers with citations. Deep search expands your query with AI." },
  { icon: Search, title: "Advanced search", text: "Full text plus mood, tag, date-range and oldest/newest ordering." },
  { icon: Images, title: "Rich multimedia", text: "Images, video, audio, PDFs and docs attached to every entry." },
  { icon: Lock, title: "Private by design", text: "Clerk sign-in isolates every row by user id. Your keys, your data." },
  { icon: Download, title: "Yours to keep", text: "One-click JSON / Markdown export. No lock-in, ever." },
];

const SHOWS = [
  { href: "/showcase/kage", kicker: "Ember temple", title: "Kage ⛩️", text: "Scroll-driven temple journey in a local Three.js world." },
  { href: "/showcase/sketchbook", kicker: "Paper & ink", title: "Sketchbook 📖", text: "Singapore sketchbook with curled page turns and magnifier." },
  { href: "/showcase/studio", kicker: "Monochrome OS", title: "Studio OS 🖥️", text: "Live diagnostics, journal cells, dock and terminal." },
];

export default function Landing() {
  return (
    <div className="relative -mx-4 -my-8 px-4 py-8">
      <Orbs />

      {/* HERO */}
      <section className="relative mx-auto max-w-4xl pt-14 text-center sm:pt-20">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white/70 px-4 py-1.5 text-xs font-semibold text-zinc-700 backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-200">
            <span className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />
            Private AI journal · your own Neon Postgres + S3/R2 + Gemini
          </span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-7xl"
        >
          Your mind,
          <br />
          <span className="bg-gradient-to-r from-blue-700 via-blue-500 to-zinc-500 bg-clip-text text-transparent dark:from-blue-400 dark:via-blue-300 dark:to-zinc-400">
            beautifully kept.
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-base text-zinc-600 dark:text-zinc-300 sm:text-lg"
        >
          Speak, write, attach, search and ask — an ultra-advanced journal where Gemini
          transcribes your voice, tags your thoughts, and answers from your own entries.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-wrap justify-center gap-3"
        >
          <Link href="/journal">
            <Button className="px-6 py-3 text-base transition hover:-translate-y-0.5 hover:shadow-lg">
              Start journaling <ArrowRight className="ml-1 inline h-4 w-4" />
            </Button>
          </Link>
          <Link href="/showcase">
            <Button variant="secondary" className="px-6 py-3 text-base transition hover:-translate-y-0.5">
              <Play className="mr-1 inline h-4 w-4" /> Explore showcase
            </Button>
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-zinc-500"
        >
          {["Google sign-in", "LinkedIn sign-in", "Facebook sign-in", "Email sign-in"].map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-blue-600" /> {s}
            </span>
          ))}
        </motion.div>
      </section>

      {/* STATS */}
      <motion.section
        {...fadeUp}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative mx-auto mt-16 grid max-w-4xl grid-cols-3 gap-3"
      >
        {[
          { icon: Database, big: "100%", small: "Your Postgres" },
          { icon: Cpu, big: "4+", small: "Gemini superpowers" },
          { icon: Cloud, big: "50MB", small: "Uploads per file" },
        ].map((s) => (
          <div
            key={s.small}
            className="rounded-2xl border border-zinc-200 bg-white/80 p-4 text-center backdrop-blur transition hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950/80"
          >
            <s.icon className="mx-auto h-5 w-5 text-blue-600" />
            <div className="mt-1 text-2xl font-extrabold">{s.big}</div>
            <div className="text-xs text-zinc-500">{s.small}</div>
          </div>
        ))}
      </motion.section>

      {/* FEATURES */}
      <section className="relative mx-auto mt-20 max-w-5xl">
        <motion.h2 {...fadeUp} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
          Ultra-advanced, yet effortless
        </motion.h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: Math.min(i * 0.07, 0.35) }}
              whileHover={{ y: -6 }}
              className="group rounded-2xl border border-zinc-200 bg-white/80 p-5 backdrop-blur transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950/80"
            >
              <div className="inline-flex rounded-xl bg-blue-600/10 p-2.5 transition group-hover:scale-110 group-hover:bg-blue-600/20">
                <f.icon className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="mt-3 font-bold">{f.title}</h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SHOWCASE TEASER */}
      <section className="relative mx-auto mt-20 max-w-5xl">
        <motion.h2 {...fadeUp} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
          Step inside three worlds
        </motion.h2>
        <p className="mt-2 text-center text-sm text-zinc-500">Sign in once — all three experiences unlock.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {SHOWS.map((s, i) => (
            <motion.div
              key={s.href}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className="overflow-hidden rounded-2xl border border-zinc-200 bg-white/80 backdrop-blur transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950/80"
            >
              <Link href={s.href} className="block">
                <div className="relative h-32 overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-700 to-blue-900">
                  <motion.div
                    className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-blue-500/40 blur-2xl"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 5, repeat: Infinity }}
                  />
                  <div className="absolute bottom-3 left-4 text-[11px] font-semibold uppercase tracking-widest text-zinc-300">
                    {s.kicker}
                  </div>
                  <div className="absolute bottom-3 right-4 text-xl transition-transform duration-300 group-hover:scale-125">
                    →
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold">{s.title}</h3>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{s.text}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <motion.section
        {...fadeUp}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative mx-auto mt-20 max-w-4xl overflow-hidden rounded-3xl bg-zinc-950 p-10 text-center text-white dark:bg-white dark:text-zinc-950"
      >
        <motion.div
          className="absolute -left-10 -top-10 h-48 w-48 rounded-full bg-blue-600/30 blur-3xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <h2 className="relative text-3xl font-extrabold tracking-tight sm:text-4xl">
          Begin your first entry tonight
        </h2>
        <p className="relative mx-auto mt-3 max-w-xl text-sm text-zinc-400 dark:text-zinc-600">
          One account. Your database. Your files. Your AI. Two minutes to set up, a lifetime of memory.
        </p>
        <div className="relative mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/journal">
            <Button className="bg-blue-600 px-6 py-3 text-base hover:bg-blue-500">
              Sign up free <ArrowRight className="ml-1 inline h-4 w-4" />
            </Button>
          </Link>
          <Link href="/connect">
            <span className="inline-block rounded-xl px-6 py-3 text-base font-semibold text-zinc-300 underline-offset-4 transition hover:text-white hover:underline dark:text-zinc-700 dark:hover:text-zinc-950">
              How hosting works
            </span>
          </Link>
        </div>
      </motion.section>
    </div>
  );
}
