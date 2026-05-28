// Author "What you'll learn" learning points for the 5 Module 1 lessons of
// the "Content That Connects" program. Idempotent: re-running overwrites the
// learning_points for those lessons with the curated set below.
//
// Run: node scripts/seed-module1-learning-points.mjs

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
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const PROGRAM_SLUG = "content-that-connects";

const H = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  "Content-Type": "application/json",
};

const lp = (key, n, icon, title, description, actionStep = null) => ({
  id: `lp-${key}-${n}`,
  icon,
  title,
  description,
  actionStep,
});

// Curated, lesson-specific learning points. Keyed by a keyword found in the
// lesson title so matching is order-independent.
const CONTENT = {
  viral: [
    lp("viral", 1, "layers", "The 4 building blocks of a viral post",
      "Break any high-performing post into its hook, value, format, and call-to-action so you can reverse-engineer what works.",
      { title: "Deconstruct 3 viral posts", description: "Pick three posts that blew up in your niche and label each part — hook, value, format, CTA." }),
    lp("viral", 2, "trending-up", "Why posts actually get shared",
      "Understand the emotional and practical triggers — relatability, usefulness, and status — that make people hit share."),
    lp("viral", 3, "target", "Spot the pattern in your niche",
      "Learn to study the top posts in your space and identify the repeatable structure behind their reach."),
  ],
  format: [
    lp("format", 1, "layers", "Match the format to the message",
      "Know when to reach for carousels, short-form video, threads, or single images to get the most out of every idea.",
      { title: "Pick your 2 go-to formats", description: "Choose the two formats you'll commit to this month based on your strengths and platform." }),
    lp("format", 2, "video", "Formats the algorithm rewards",
      "See which formats each platform pushes hardest and why saves, shares, and watch-time matter more than likes."),
    lp("format", 3, "rocket", "Turn one idea into many",
      "Repurpose a single core idea across multiple formats so you create less but publish more consistently."),
  ],
  hook: [
    lp("hook", 1, "zap", "Stop the scroll in 3 seconds",
      "Craft opening lines and visuals that grab attention before viewers swipe away.",
      { title: "Write 5 hooks for one idea", description: "Take a single content idea, draft five different hooks, then pick the strongest one." }),
    lp("hook", 2, "pencil", "Hook formulas that always work",
      "Use proven templates — curiosity gaps, bold claims, and relatable problems — to open any post with confidence."),
    lp("hook", 3, "anchor", "Match the hook to the payoff",
      "Avoid clickbait by making sure your hook sets up a promise the rest of the post actually delivers."),
  ],
  retention: [
    lp("retention", 1, "trending-up", "Keep them watching to the end",
      "Learn the pacing, open loops, and transitions that hold attention all the way through.",
      { title: "Find your drop-off point", description: "Review a recent video's retention graph, note where people leave, and plan one fix." }),
    lp("retention", 2, "layers", "Structure built for retention",
      "Map content into a clear beginning, build, and payoff that rewards people for staying."),
    lp("retention", 3, "target", "Read your retention data",
      "Use drop-off points and average watch-time to find exactly where you lose your audience."),
  ],
  tone: [
    lp("tone", 1, "heart", "Sound like you, consistently",
      "Define a voice that feels authentic and instantly recognisable across everything you publish.",
      { title: "Write your 3 voice rules", description: "Set three rules for how you sound (e.g. 'warm, not corporate') and apply them to your next post." }),
    lp("tone", 2, "users", "Speak to your ideal audience",
      "Tune your language, references, and energy to the exact people you most want to reach."),
    lp("tone", 3, "anchor", "Build a simple voice guide",
      "Capture your do's, don'ts, and signature phrases so your content stays on-brand as you scale."),
  ],
};

function matchKey(title) {
  const t = title.toLowerCase();
  if (t.includes("viral")) return "viral";
  if (t.includes("format")) return "format";
  if (t.includes("hook")) return "hook";
  if (t.includes("retention")) return "retention";
  if (t.includes("tone")) return "tone";
  return null;
}

// 1. Resolve the program id from its slug.
const progRes = await fetch(
  `${URL}/rest/v1/programs?slug=eq.${PROGRAM_SLUG}&select=id,title`,
  { headers: H },
);
const progs = await progRes.json();
if (!progRes.ok || !Array.isArray(progs) || progs.length === 0) {
  console.error("Could not find program:", PROGRAM_SLUG, progs);
  process.exit(1);
}
const program = progs[0];
console.log(`Program: ${program.title} (${program.id})`);

// 2. Fetch Module 1 lessons.
const lessonsRes = await fetch(
  `${URL}/rest/v1/lessons?program_id=eq.${program.id}&module_number=eq.1&select=id,slug,title,sort_order&order=sort_order.asc`,
  { headers: H },
);
const lessons = await lessonsRes.json();
if (!lessonsRes.ok || !Array.isArray(lessons)) {
  console.error("Could not fetch Module 1 lessons:", lessons);
  process.exit(1);
}
console.log(`Module 1 lessons found: ${lessons.length}`);

// 3. Patch each lesson's learning_points.
let updated = 0;
for (const lesson of lessons) {
  const key = matchKey(lesson.title);
  if (!key) {
    console.warn(`  - skip "${lesson.title}" (no matching content key)`);
    continue;
  }
  const points = CONTENT[key];
  const patch = await fetch(`${URL}/rest/v1/lessons?id=eq.${lesson.id}`, {
    method: "PATCH",
    headers: { ...H, Prefer: "return=representation" },
    body: JSON.stringify({ learning_points: points }),
  });
  const body = await patch.text();
  if (!patch.ok) {
    console.error(`  ✗ "${lesson.title}" failed (HTTP ${patch.status}): ${body}`);
    if (body.includes("learning_points") && body.includes("column")) {
      console.error("    → learning_points column missing. Apply migration 0036 first.");
    }
    continue;
  }
  console.log(`  ✓ "${lesson.title}" — ${points.length} learning points`);
  updated += 1;
}

console.log(`\nDone. Updated ${updated}/${lessons.length} Module 1 lessons.`);
