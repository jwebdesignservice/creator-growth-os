// Seed 3 clean STANDALONE tutorials (program_id IS NULL) so the Tutorials
// library has real short-form how-to examples after separating it from
// program lessons. Idempotent: upserts by slug.
//
// Run: node scripts/seed-standalone-tutorials.mjs

import { readFileSync } from "node:fs";
import path from "node:path";

const env = Object.fromEntries(
  readFileSync(path.resolve(process.cwd(), ".env.local"), "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
    }),
);

const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

// Short (1–5 min) standalone how-to tutorials. program_id stays null so they
// only ever appear in the Tutorials library, never inside a program.
const TUTORIALS = [
  {
    slug: "tut-film-clean-talking-head",
    title: "Film a Clean Talking-Head Clip",
    description: "A 3-minute walkthrough for framing, focus, and audio so your on-camera clips look sharp with just a phone.",
    duration_seconds: 180,
    sort_order: 1,
  },
  {
    slug: "tut-quick-lighting-setup",
    title: "Set Up Good Lighting in 5 Minutes",
    description: "Turn any room into a clean shooting space with one light and a window — no expensive gear required.",
    duration_seconds: 240,
    sort_order: 2,
  },
  {
    slug: "tut-caption-that-converts",
    title: "Write a Caption That Converts",
    description: "A fast formula — hook, value, call-to-action — for captions that stop the scroll and drive replies.",
    duration_seconds: 150,
    sort_order: 3,
  },
];

const rows = TUTORIALS.map((t) => ({
  slug: t.slug,
  title: t.title,
  description: t.description,
  plan_access: "free",
  content_type: "video",
  difficulty: "Beginner",
  published: true,
  video_url: null,
  duration_seconds: t.duration_seconds,
  program_id: null, // STANDALONE — never attached to a program
  sort_order: t.sort_order,
}));

const res = await fetch(`${URL}/rest/v1/lessons?on_conflict=slug`, {
  method: "POST",
  headers: { ...H, Prefer: "resolution=merge-duplicates,return=representation" },
  body: JSON.stringify(rows),
});
const body = await res.text();
if (!res.ok) {
  console.error(`Upsert failed (HTTP ${res.status}): ${body}`);
  process.exit(1);
}
const saved = JSON.parse(body);
console.log(`Upserted ${saved.length} standalone tutorials:`);
for (const r of saved) console.log(`  ✓ ${r.title}  (${r.duration_seconds}s, published=${r.published}, program_id=${r.program_id})`);
