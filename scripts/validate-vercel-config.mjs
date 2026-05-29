#!/usr/bin/env node
/* eslint-disable no-console */
/*
 * Validate vercel.json against the constraints of this project's Vercel
 * tier (Hobby). Hobby rejects any cron schedule that would fire more
 * than once per day, and the rejection happens at deploy registration
 * time — before the build even runs — so every push that violates it
 * silently fails to land on production.
 *
 * Run on every CI deploy (`scripts: validate:vercel`) and locally as
 * part of `npm run typecheck`. If a future contributor sets a cron to
 * a sub-daily schedule (e.g. every 15 minutes) again, this script
 * fails loudly with a clear remediation.
 *
 * If/when the project upgrades to Vercel Pro, set HOBBY=false at the
 * top to relax the cron check (or remove this script).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HOBBY = true;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const FILE = path.join(ROOT, "vercel.json");

if (!fs.existsSync(FILE)) {
  // vercel.json is optional — no config, nothing to validate.
  process.exit(0);
}

let config;
try {
  config = JSON.parse(fs.readFileSync(FILE, "utf8"));
} catch (err) {
  fail(`vercel.json is not valid JSON: ${err.message}`);
}

const crons = Array.isArray(config.crons) ? config.crons : [];

for (const cron of crons) {
  if (!cron || typeof cron !== "object") {
    fail(`vercel.json: crons[] entries must be objects, got: ${JSON.stringify(cron)}`);
  }
  if (typeof cron.schedule !== "string") {
    fail(
      `vercel.json: cron for path "${cron.path ?? "?"}" is missing a string "schedule".`,
    );
  }
  if (typeof cron.path !== "string" || !cron.path.startsWith("/")) {
    fail(
      `vercel.json: cron with schedule "${cron.schedule}" needs an absolute path (starts with "/").`,
    );
  }
  if (HOBBY) {
    const runsPerDay = countDailyFirings(cron.schedule);
    if (runsPerDay > 1) {
      fail(
        [
          `vercel.json: cron "${cron.path}" with schedule "${cron.schedule}" would`,
          `fire ${runsPerDay} times per day. Vercel's Hobby plan only allows`,
          `crons that run at most once per day. This will reject EVERY deploy`,
          `with: "Hobby accounts are limited to daily cron jobs".`,
          ``,
          `Fix one of:`,
          `  - Change the schedule to a once-a-day cron, e.g. "0 9 * * *".`,
          `  - Upgrade Vercel to Pro and flip HOBBY=false at the top of`,
          `    scripts/validate-vercel-config.mjs.`,
          `  - Move the cron off Vercel (cron-job.org, GitHub Actions cron).`,
        ].join("\n"),
      );
    }
  }
}

console.log(`✓ vercel.json passes validation (${crons.length} cron job(s) checked).`);
process.exit(0);

/* ─────────────────────────────────────────────────────────────────────
 * Cron parsing — enough to spot multi-fire-per-day schedules without
 * pulling a 200KB dep just for CI lint. We compute, on a single day,
 * how many distinct (hour, minute) firings the expression matches.
 * ───────────────────────────────────────────────────────────────────── */

function countDailyFirings(expr) {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) {
    fail(
      `vercel.json: cron schedule "${expr}" must have exactly 5 fields ` +
        `(minute hour day-of-month month day-of-week), got ${parts.length}.`,
    );
  }
  const [minute, hour /* , dom, mon, dow */] = parts;
  const minutes = expandField(minute, 0, 59, expr);
  const hours = expandField(hour, 0, 23, expr);
  // Day-of-month / month / day-of-week don't affect "how many times per
  // day" — they only affect WHICH days fire. The Hobby ceiling is about
  // firings per 24h, so this approximation is exact for any expression
  // we're likely to see.
  return minutes.length * hours.length;
}

function expandField(field, min, max, expr) {
  // Handles: "*", "*/N", "a-b", "a-b/N", "a,b,c", and single integers.
  // Each comma-separated chunk expands independently, then the union is
  // returned (sorted, deduplicated).
  const out = new Set();
  for (const chunk of field.split(",")) {
    let stepMatch = chunk.match(/^(.+?)\/(\d+)$/);
    let base = chunk;
    let step = 1;
    if (stepMatch) {
      base = stepMatch[1];
      step = parseInt(stepMatch[2], 10);
      if (!Number.isFinite(step) || step <= 0) {
        fail(`vercel.json: cron "${expr}" has an invalid step in "${chunk}".`);
      }
    }
    let lo;
    let hi;
    if (base === "*") {
      lo = min;
      hi = max;
    } else if (/^\d+$/.test(base)) {
      lo = parseInt(base, 10);
      hi = stepMatch ? max : lo; // bare step on a single integer is unusual; treat as upper-bound = max
    } else {
      const range = base.match(/^(\d+)-(\d+)$/);
      if (!range) {
        fail(`vercel.json: cron "${expr}" has an unparseable chunk "${chunk}".`);
      }
      lo = parseInt(range[1], 10);
      hi = parseInt(range[2], 10);
    }
    if (lo < min || hi > max || lo > hi) {
      fail(
        `vercel.json: cron "${expr}" range "${chunk}" out of bounds for field ` +
          `[${min}..${max}].`,
      );
    }
    for (let v = lo; v <= hi; v += step) out.add(v);
  }
  return [...out].sort((a, b) => a - b);
}

function fail(msg) {
  console.error(`\n\x1b[31m✗ ${msg}\x1b[0m\n`);
  process.exit(1);
}
