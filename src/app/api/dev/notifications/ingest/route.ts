import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { notifyDev, type NotifyDevInput } from "@/lib/dev-dashboard/dev-notifications-writer";

/* ─────────────────────────────────────────────────────────────────────────
   POST /api/dev/notifications/ingest

   Signed webhook endpoint for external systems (Stripe webhook relays,
   GitHub Actions deploy hooks, status-page providers, monitoring tools)
   to push notifications into the dev inbox.

   Auth: every request must carry an `X-Dev-Signature` header containing
         `sha256=<hex>` of HMAC-SHA256(rawBody, DEV_NOTIFICATIONS_INGEST_SECRET).
         Comparison is timing-safe.

   Body: JSON matching NotifyDevInput. Accepts a single object or an
         array; arrays are processed in order, returning an array of ids.

   Never throws on application errors — returns structured JSON so the
   caller can decide how to react.
   ───────────────────────────────────────────────────────────────────────── */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SIGNATURE_HEADER = "x-dev-signature";
const SECRET_ENV       = "DEV_NOTIFICATIONS_INGEST_SECRET";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const secret = process.env[SECRET_ENV];
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: `Endpoint not configured: missing ${SECRET_ENV}` },
      { status: 503 },
    );
  }

  const provided = req.headers.get(SIGNATURE_HEADER);
  if (!provided) {
    return NextResponse.json(
      { ok: false, error: `Missing ${SIGNATURE_HEADER} header` },
      { status: 401 },
    );
  }

  const rawBody = await req.text();
  if (!verifySignature(rawBody, provided, secret)) {
    return NextResponse.json(
      { ok: false, error: "Invalid signature" },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Body must be valid JSON" },
      { status: 400 },
    );
  }

  const payloads = Array.isArray(body) ? body : [body];
  const validated: NotifyDevInput[] = [];
  for (const [i, raw] of payloads.entries()) {
    const parsed = parseInput(raw);
    if (!parsed.ok) {
      return NextResponse.json(
        { ok: false, error: `Item ${i}: ${parsed.error}` },
        { status: 400 },
      );
    }
    validated.push(parsed.value);
  }

  const results: Array<{ ok: true; id: string } | { ok: false; error: string }> = [];
  for (const input of validated) {
    results.push(await notifyDev(input));
  }

  const allOk = results.every((r) => r.ok);
  return NextResponse.json(
    { ok: allOk, count: results.length, results },
    { status: allOk ? 200 : 207 },
  );
}

/* ─── Validation ─────────────────────────────────────────────────────── */

const CATEGORIES = new Set([
  "incident", "deploy", "security", "billing", "system", "audit",
]);
const SEVERITIES = new Set([
  "critical", "high", "medium", "low", "info",
]);

type ParseOk  = { ok: true;  value: NotifyDevInput };
type ParseErr = { ok: false; error: string };

function parseInput(raw: unknown): ParseOk | ParseErr {
  if (!raw || typeof raw !== "object") return { ok: false, error: "must be a JSON object" };
  const o = raw as Record<string, unknown>;

  if (typeof o.title !== "string" || o.title.length === 0) {
    return { ok: false, error: "title (string) is required" };
  }
  if (typeof o.category !== "string" || !CATEGORIES.has(o.category)) {
    return { ok: false, error: `category must be one of ${[...CATEGORIES].join(", ")}` };
  }
  if (o.severity !== undefined && (typeof o.severity !== "string" || !SEVERITIES.has(o.severity))) {
    return { ok: false, error: `severity must be one of ${[...SEVERITIES].join(", ")}` };
  }

  return {
    ok: true,
    value: {
      title:       o.title,
      category:    o.category   as NotifyDevInput["category"],
      severity:    o.severity   as NotifyDevInput["severity"] | undefined,
      body:        typeof o.body         === "string" ? o.body         : undefined,
      source:      typeof o.source       === "string" ? o.source       : undefined,
      traceId:     typeof o.traceId      === "string" ? o.traceId      : undefined,
      actionLabel: typeof o.actionLabel  === "string" ? o.actionLabel  : undefined,
      actionUrl:   typeof o.actionUrl    === "string" ? o.actionUrl    : undefined,
      dedupKey:    typeof o.dedupKey     === "string" ? o.dedupKey     : undefined,
      metadata:    typeof o.metadata     === "object" && o.metadata !== null
                     ? (o.metadata as Record<string, unknown>) : undefined,
    },
  };
}

/* ─── Signature verification ─────────────────────────────────────────── */

function verifySignature(rawBody: string, header: string, secret: string): boolean {
  // Accept "sha256=<hex>" (GitHub-style) or bare hex.
  const provided = header.startsWith("sha256=") ? header.slice(7) : header;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");

  if (provided.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(provided, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}
