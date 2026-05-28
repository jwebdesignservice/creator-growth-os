// Repair seed: the live DB diverged from migration 0003_lessons_seed.sql —
// the three non-flagship programs ended up with ZERO lessons, so their
// curriculum fell back to hardcoded mock data that could never track real
// completion. This script seeds each empty program with its OWN real lessons
// (unique slugs, modules, order, duration) so progress is tracked per program.
//
// NON-DESTRUCTIVE & idempotent: upserts by slug with resolution=ignore-
// duplicates, so existing lessons (and their lesson_progress / task links)
// are never touched or regenerated. Safe to re-run.
//
// A fresh database already gets these via migration 0003; this only repairs
// the current live DB.
//
// Run: node scripts/seed-program-curricula.mjs

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

// [slug, title, duration_seconds, module_number, module_title, plan_access, sort_order]
const CURRICULA = {
  "content-that-connects": [
    ["ctc-anatomy-of-a-viral-post", "Anatomy of a Viral Post", 525, 1, "Content Fundamentals", "basic", 1],
    ["ctc-formats-that-spread", "Formats That Spread", 610, 1, "Content Fundamentals", "basic", 2],
    ["ctc-write-the-perfect-hook", "Write the Perfect Hook", 480, 1, "Content Fundamentals", "basic", 3],
    ["ctc-retention-blueprint", "The Retention Blueprint", 715, 1, "Content Fundamentals", "basic", 4],
    ["ctc-tone-of-voice", "Find Your Tone of Voice", 550, 1, "Content Fundamentals", "basic", 5],
    ["ctc-pillars-to-posts", "Pillars to Posts: Idea Pipelines", 640, 2, "Build Your System", "basic", 6],
    ["ctc-weekly-schedule", "Your Weekly Schedule That Works", 595, 2, "Build Your System", "basic", 7],
    ["ctc-batching", "Batching Without Burnout", 520, 2, "Build Your System", "basic", 8],
    ["ctc-editing-shortcuts", "Editing Shortcuts That Save Hours", 680, 2, "Build Your System", "basic", 9],
    ["ctc-on-camera-confidence", "On-Camera Confidence", 595, 2, "Build Your System", "basic", 10],
    ["ctc-cross-platform", "Cross-Platform Without Burning Out", 750, 2, "Build Your System", "basic", 11],
    ["ctc-platform-analytics", "Reading Platform Analytics", 810, 3, "Grow on Purpose", "basic", 12],
    ["ctc-your-first-1000", "Your First 1,000 True Fans", 650, 3, "Grow on Purpose", "basic", 13],
    ["ctc-collabs-that-grow", "Collabs That Actually Grow You", 620, 3, "Grow on Purpose", "basic", 14],
    ["ctc-comment-strategy", "Strategic Commenting & DMs", 520, 3, "Grow on Purpose", "basic", 15],
    ["ctc-content-audit", "The 30-Minute Content Audit", 445, 3, "Grow on Purpose", "basic", 16],
    ["ctc-test-and-double-down", "Test, Iterate, Double Down", 590, 3, "Grow on Purpose", "basic", 17],
    ["ctc-ai-content-assist", "AI-Assisted Content Workflow", 720, 4, "Pro Workflows", "pro", 18],
    ["ctc-team-handoff", "Handing Off to an Editor", 605, 4, "Pro Workflows", "pro", 19],
    ["ctc-content-ops", "Content Ops at Scale", 680, 4, "Pro Workflows", "pro", 20],
  ],
  "monetize-your-influence": [
    ["myi-monetization-mindset", "The Monetization Mindset", 515, 1, "Set Your Foundation", "basic", 1],
    ["myi-readiness-score", "Readiness Score: Are You Ready?", 605, 1, "Set Your Foundation", "basic", 2],
    ["myi-pricing-fundamentals", "Pricing Fundamentals", 680, 1, "Set Your Foundation", "basic", 3],
    ["myi-rate-card-builder", "Build Your Rate Card", 590, 1, "Set Your Foundation", "basic", 4],
    ["myi-niching-for-revenue", "Niching for Revenue", 540, 1, "Set Your Foundation", "basic", 5],
    ["myi-media-kit-fast", "Media Kit in 30 Minutes", 625, 2, "Brand Deals", "basic", 6],
    ["myi-finding-brands", "Finding Brands That Pay", 715, 2, "Brand Deals", "basic", 7],
    ["myi-cold-outreach", "Cold Outreach That Lands", 810, 2, "Brand Deals", "basic", 8],
    ["myi-pitching", "Pitching Without Cringing", 660, 2, "Brand Deals", "basic", 9],
    ["myi-deliverables", "Deliverables That Make Brands Repeat", 590, 2, "Brand Deals", "basic", 10],
    ["myi-contracts-basics", "Contracts You Actually Sign", 745, 2, "Brand Deals", "basic", 11],
    ["myi-getting-paid", "Getting Paid (and Paid On Time)", 520, 2, "Brand Deals", "basic", 12],
    ["myi-affiliate-101", "Affiliate Marketing 101", 580, 3, "Diversify Your Income", "basic", 13],
    ["myi-digital-products", "Your First Digital Product", 870, 3, "Diversify Your Income", "basic", 14],
    ["myi-services-offer", "The Services Offer Stack", 690, 3, "Diversify Your Income", "basic", 15],
    ["myi-community-membership", "Community & Membership", 810, 3, "Diversify Your Income", "basic", 16],
    ["myi-sponsorship-stack", "Stacking Sponsorship Income", 600, 3, "Diversify Your Income", "basic", 17],
    ["myi-newsletter-monetize", "Monetizing a Newsletter", 525, 3, "Diversify Your Income", "basic", 18],
    ["myi-tax-and-business", "Tax & Business Basics for Creators", 905, 4, "Run the Business", "pro", 19],
    ["myi-revenue-systems", "Revenue Systems & Automation", 780, 4, "Run the Business", "pro", 20],
    ["myi-financial-runway", "Financial Runway & Reinvestment", 715, 4, "Run the Business", "pro", 21],
    ["myi-build-an-asset", "Build an Asset, Not Just an Audience", 640, 4, "Run the Business", "pro", 22],
  ],
  "scale-and-automate": [
    ["sa-creator-business", "The Creator Business Mindset", 640, 1, "Scale Foundations", "pro", 1],
    ["sa-systems-thinking", "Systems Thinking for Creators", 715, 1, "Scale Foundations", "pro", 2],
    ["sa-org-design", "Org Design: You + 1 + 3", 680, 1, "Scale Foundations", "pro", 3],
    ["sa-decision-frameworks", "Decision Frameworks at Scale", 595, 1, "Scale Foundations", "pro", 4],
    ["sa-sop-creator", "SOPs for Creator Workflows", 810, 2, "Operations", "pro", 5],
    ["sa-hiring-editor", "Hiring Your First Editor", 780, 2, "Operations", "pro", 6],
    ["sa-hiring-manager", "Hiring a Manager (or Not)", 640, 2, "Operations", "pro", 7],
    ["sa-team-rituals", "Weekly Team Rituals", 520, 2, "Operations", "pro", 8],
    ["sa-async-comms", "Async Communication", 490, 2, "Operations", "pro", 9],
    ["sa-automate-scheduling", "Automating Scheduling & Posting", 620, 3, "Automation", "pro", 10],
    ["sa-automate-engagement", "Automating Engagement (Without Bots)", 715, 3, "Automation", "pro", 11],
    ["sa-content-repurposing", "Content Repurposing Pipelines", 680, 3, "Automation", "pro", 12],
    ["sa-data-pipelines", "Data Pipelines for Creators", 850, 3, "Automation", "pro", 13],
    ["sa-ai-co-pilot", "AI as Your Co-Pilot", 790, 3, "Automation", "pro", 14],
    ["sa-product-flywheel", "Build a Product Flywheel", 870, 4, "Leverage & Exit", "pro", 15],
    ["sa-community-leverage", "Leverage Through Community", 640, 4, "Leverage & Exit", "pro", 16],
    ["sa-licensing-ip", "Licensing Your IP", 595, 4, "Leverage & Exit", "pro", 17],
    ["sa-acquisition-paths", "Acquisition & Exit Paths", 780, 4, "Leverage & Exit", "pro", 18],
    ["sa-second-act", "The Creator Second Act", 525, 4, "Leverage & Exit", "pro", 19],
    ["sa-final-build", "Final Build: Your 12-Month Plan", 1020, 4, "Leverage & Exit", "pro", 20],
  ],
};

// Resolve program ids by slug so we never hardcode UUIDs.
const slugs = Object.keys(CURRICULA);
const progRes = await fetch(
  `${URL}/rest/v1/programs?select=id,slug&slug=in.(${slugs.join(",")})`,
  { headers: H },
);
const programs = await progRes.json();
const idBySlug = new Map(programs.map((p) => [p.slug, p.id]));

let totalUpserted = 0;
for (const slug of slugs) {
  const programId = idBySlug.get(slug);
  if (!programId) {
    console.error(`  ✗ program not found: ${slug} — skipping`);
    continue;
  }

  const rows = CURRICULA[slug].map(([s, title, secs, mod, modTitle, plan, order]) => ({
    program_id: programId,
    slug: s,
    title,
    description: null,
    duration_seconds: secs,
    module_number: mod,
    module_title: modTitle,
    plan_access: plan,
    content_type: "video",
    sort_order: order,
    published: true,
  }));

  // ignore-duplicates => ON CONFLICT (slug) DO NOTHING (non-destructive).
  const res = await fetch(`${URL}/rest/v1/lessons?on_conflict=slug`, {
    method: "POST",
    headers: { ...H, Prefer: "resolution=ignore-duplicates,return=representation" },
    body: JSON.stringify(rows),
  });
  const body = await res.text();
  if (!res.ok) {
    console.error(`  ✗ ${slug}: upsert failed (HTTP ${res.status}): ${body}`);
    process.exit(1);
  }
  const saved = JSON.parse(body);
  totalUpserted += saved.length;
  console.log(`  ✓ ${slug}: ${rows.length} lessons sent, ${saved.length} inserted`);
}

// Verify final per-program counts.
console.log("\nFinal lesson counts:");
for (const slug of slugs) {
  const programId = idBySlug.get(slug);
  const res = await fetch(
    `${URL}/rest/v1/lessons?program_id=eq.${programId}&select=id`,
    { headers: { ...H, Prefer: "count=exact" } },
  );
  const range = res.headers.get("content-range");
  console.log(`  ${slug}: ${range}`);
}
console.log(`\nDone. ${totalUpserted} new lesson rows inserted.`);
