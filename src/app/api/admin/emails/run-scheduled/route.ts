import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { processDueScheduledEmails } from "@/app/admin/emails/actions";

/* ─────────────────────────────────────────────────────────────────────────
   POST/GET /api/admin/emails/run-scheduled

   Cron entrypoint that delivers any scheduled campaigns whose time has come.
   Point an external scheduler (e.g. Vercel Cron, GitHub Actions, cron-job.org)
   at this URL on an every-few-minutes schedule. With Vercel, add a cron entry
   in vercel.json targeting this path; Vercel automatically sends
   `Authorization: Bearer $CRON_SECRET`.

   Auth: requires `Authorization: Bearer <CRON_SECRET>` (timing-safe compare).
         Without CRON_SECRET set, the endpoint is disabled (503) so it can
         never run unauthenticated.

   Safety: delivery still flows through the email safety gate — in safe mode
           scheduled sends are redirected to the test inbox, never real users.
   ───────────────────────────────────────────────────────────────────────── */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization") ?? "";
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

async function handle(req: NextRequest): Promise<NextResponse> {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json(
      { ok: false, error: "Endpoint disabled: CRON_SECRET is not set." },
      { status: 503 },
    );
  }
  if (!authorized(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const result = await processDueScheduledEmails({ cronAuthorized: true });
  const status = result.ok ? 200 : 500;
  return NextResponse.json(result, { status });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  return handle(req);
}

// GET supported so simple cron providers that only issue GETs still work.
export async function GET(req: NextRequest): Promise<NextResponse> {
  return handle(req);
}
