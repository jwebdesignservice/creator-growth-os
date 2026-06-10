import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { runDueScheduledAssignments } from "@/lib/tasks/schedule";

/* ─────────────────────────────────────────────────────────────────────────
   Trigger endpoint for the scheduled auto-assign engine.

   Assigns every due `admin_mission` task_template to its eligible users.
   Idempotent — safe to hit every 15 minutes (the `period_key` dedup means a
   daily task assigns once per day no matter how often this runs).

   Auth: requires `Authorization: Bearer <CRON_SECRET>` (or the raw secret).
   Vercel Cron sends this header automatically once CRON_SECRET is set in the
   project env. Supabase pg_cron can send it via net.http_post headers.

   Both GET and POST are accepted (Vercel Cron uses GET).
   ───────────────────────────────────────────────────────────────────────── */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  // No secret configured → refuse. Never leave the trigger open.
  if (!secret) return false;
  const header = req.headers.get("authorization") ?? "";
  // Timing-safe compare (mirrors /api/admin/emails/run-scheduled). Accepts
  // `Bearer <secret>` or the raw secret, as before.
  const token = header.startsWith("Bearer ") ? header.slice(7) : header;
  const a = Buffer.from(token);
  const b = Buffer.from(secret);
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

async function handle(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const result = await runDueScheduledAssignments();
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}

export async function POST(req: NextRequest) {
  return handle(req);
}

export async function GET(req: NextRequest) {
  return handle(req);
}
