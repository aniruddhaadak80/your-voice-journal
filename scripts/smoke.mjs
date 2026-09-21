// Zero-dependency route smoke test: `pnpm smoke` (dev server must be running)
// or SMOKE_BASE=https://your-voice-journal.vercel.app pnpm smoke
const base = process.env.SMOKE_BASE ?? "http://localhost:3000";

// expect: allowed status codes. match: substring that must appear in body.
const CHECKS = [
  // Public: landing, auth flows, health.
  { path: "/", expect: [200], match: "beautifully kept" },
  { path: "/sign-in", expect: [200] },
  { path: "/sign-up", expect: [200] },
  { path: "/api/status", expect: [200], match: '"db"' },
  // Walled (anonymous → Clerk redirects to sign-in when keys are on).
  { path: "/journal", expect: [307, 308] },
  { path: "/connect", expect: [307, 308] },
  { path: "/settings", expect: [307, 308] },
  { path: "/showcase", expect: [307, 308] },
  { path: "/showcase/kage", expect: [307, 308] },
  { path: "/showcase/sketchbook", expect: [307, 308] },
  { path: "/showcase/studio", expect: [307, 308] },
  { path: "/entry/new", expect: [307, 308] },
  { path: "/api/status", expect: [200], match: '"db"' },
  { path: "/sitemap.xml", expect: [200], match: "/showcase/studio" },
  { path: "/robots.txt", expect: [200], match: "Disallow: /api/" },
  { path: "/manifest.webmanifest", expect: [200], match: "Journal" },
  { path: "/landing-pages/kage.html", expect: [200] },
  { path: "/landing-pages/meng-to-sketchbook.html", expect: [200], match: "Sketchbook" },
  // Gated writes, anonymous: 401 when Clerk is on, 400/200 in demo or unconfigured states.
  { path: "/api/ai", method: "POST", body: { mode: "ask", query: "ping" }, expect: [401, 400] },
  { path: "/api/export?format=json", expect: [200, 400, 401] },
  { path: "/api/connect/test", method: "POST", body: { kind: "clerk", values: {} }, expect: [401, 200] },
  // Unknown paths hit the auth wall (307) before Next routing can 404 — correct: no route leaks.
  { path: "/nope-not-a-route", expect: [307, 308, 404] },
];

async function probe(c, timeoutMs) {
  const res = await fetch(base + c.path, {
    method: c.method ?? "GET",
    redirect: "manual", // see the 307 wall instead of following it
    headers: c.body ? { "Content-Type": "application/json" } : undefined,
    body: c.body ? JSON.stringify(c.body) : undefined,
    signal: AbortSignal.timeout(timeoutMs),
  });
  return { status: res.status, text: await res.text() };
}

// Warm up the dev compiler (first page compiles can exceed normal timeouts).
try {
  await probe({ path: "/" }, 120000);
  console.log("WARMUP ok");
} catch {
  console.log("WARMUP slow — continuing, first checks may retry");
}

let failed = 0;
for (const c of CHECKS) {
  const label = `${c.method ?? "GET"} ${c.path}`;
  let done = false;
  for (let attempt = 1; attempt <= 2 && !done; attempt++) {
    try {
      const { status, text } = await probe(c, 60000);
      const statusOk = c.expect.includes(status);
      const matchOk = !c.match || text.includes(c.match);
      if (statusOk && matchOk) {
        console.log(`PASS ${label} -> ${status}`);
        done = true;
      } else if (attempt === 2) {
        failed++;
        console.log(`FAIL ${label} -> ${status}${!matchOk ? " (body match missing)" : ""}`);
        done = true;
      }
    } catch (e) {
      if (attempt === 2) {
        failed++;
        console.log(`FAIL ${label} -> ${e.message}`);
        done = true;
      }
    }
  }
}
console.log(failed === 0 ? `\nSMOKE GREEN (${CHECKS.length}/${CHECKS.length})` : `\nSMOKE RED (${failed} failed)`);
process.exitCode = failed === 0 ? 0 : 1;
