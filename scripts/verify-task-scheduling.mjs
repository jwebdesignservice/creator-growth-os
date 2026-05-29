// End-to-end check for the unified scheduled-missions system (migration 0041).
// Prereqs: run 0041 in Supabase, set CRON_SECRET in .env.local, and (re)start
// the dev server on :8080 so it picks up CRON_SECRET.
//
// Run: node scripts/verify-task-scheduling.mjs

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
const CRON_SECRET = env.CRON_SECRET;
const APP = env.NEXT_PUBLIC_APP_URL || "http://localhost:8080";
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

const ok = (m) => console.log(`  ✓ ${m}`);
const bad = (m) => console.log(`  ✗ ${m}`);

async function rest(method, pathq, body, extra = {}) {
  const res = await fetch(`${URL}/rest/v1/${pathq}`, {
    method,
    headers: { ...H, ...extra },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* */ }
  return { res, json, text };
}

let templateId = null;
try {
  // 1. Schema probes.
  const probeT = await rest("GET", "task_templates?select=frequency,auto_assign,schedule_time&limit=1");
  if (!probeT.res.ok) { bad(`task_templates scheduling cols missing — run 0041. (${probeT.text})`); process.exit(1); }
  ok("task_templates has scheduling columns");
  const probeM = await rest("GET", "missions?select=period_key&limit=1");
  if (!probeM.res.ok) { bad(`missions.period_key missing — run 0041. (${probeM.text})`); process.exit(1); }
  ok("missions has period_key");

  // 2. Create a test template (daily, due since 00:00 UTC, auto-assign).
  const created = await rest(
    "POST",
    "task_templates",
    {
      title: "__verify_daily__",
      description: "verification template",
      source_type: "admin_mission",
      status: "active",
      frequency: "daily",
      schedule_time: "00:00",
      timezone: "UTC",
      auto_assign: true,
      points: 5,
      auto_assign_trigger: "manual",
    },
    { Prefer: "return=representation" },
  );
  if (!created.res.ok || !created.json?.[0]?.id) { bad(`create template failed: ${created.text}`); process.exit(1); }
  templateId = created.json[0].id;
  ok(`created test template ${templateId}`);

  // 3. Targeting rule: everyone (target_type='all').
  const rule = await rest("POST", "task_assignment_rules", {
    task_template_id: templateId,
    rule_type: "include",
    target_type: "all",
    target_value: {},
    active: true,
  });
  if (!rule.res.ok) { bad(`create rule failed: ${rule.text}`); process.exit(1); }
  ok("created include-all rule");

  if (!CRON_SECRET) {
    bad("CRON_SECRET not set in .env.local — cannot test the endpoint. Set it + restart dev server, then re-run.");
    process.exit(1);
  }

  // 4. Fire the endpoint.
  const fire1 = await fetch(`${APP}/api/tasks/run-scheduled`, {
    method: "POST",
    headers: { Authorization: `Bearer ${CRON_SECRET}` },
  });
  const r1 = await fire1.json().catch(() => ({}));
  if (fire1.status === 401) { bad("endpoint 401 — dev server doesn't have CRON_SECRET (restart it)."); process.exit(1); }
  ok(`endpoint run #1 → assigned=${r1.totalAssigned} skipped=${r1.totalSkipped}`);

  const after1 = await rest("GET", `missions?task_template_id=eq.${templateId}&select=id`);
  const count1 = after1.json?.length ?? 0;
  if (count1 > 0) ok(`missions created for the template: ${count1}`);
  else bad("no missions created — check that profiles exist + rule matched");

  // 5. Fire again → period dedup should create 0 new.
  const fire2 = await fetch(`${APP}/api/tasks/run-scheduled`, {
    method: "POST",
    headers: { Authorization: `Bearer ${CRON_SECRET}` },
  });
  const r2 = await fire2.json().catch(() => ({}));
  const after2 = await rest("GET", `missions?task_template_id=eq.${templateId}&select=id`);
  const count2 = after2.json?.length ?? 0;
  if (count2 === count1) ok(`run #2 created 0 new (dedup works) — assigned=${r2.totalAssigned}`);
  else bad(`DEDUP FAILED: count went ${count1} → ${count2}`);
} finally {
  // 6. Cleanup — remove test missions, rules, template.
  if (templateId) {
    await rest("DELETE", `missions?task_template_id=eq.${templateId}`);
    await rest("DELETE", `task_assignment_rules?task_template_id=eq.${templateId}`);
    await rest("DELETE", `task_templates?id=eq.${templateId}`);
    console.log("  ✓ cleaned up test data");
  }
}
console.log("\nVerification complete.");
