import "server-only";

/* ─────────────────────────────────────────────────────────────────────────
   Email safety layer.

   Central guard that every admin send path (campaign, test, scheduled,
   resend) routes through so we can never accidentally mass-email real
   users during development — or fire an unvalidated/oversized blast in
   production.

   Behaviour is controlled by env:

     EMAIL_SAFE_MODE   — "off" enables real delivery to the resolved
                         audience. ANY other value (or unset) keeps SAFE
                         MODE on: sends are redirected to the test inbox(es)
                         and capped to a tiny sample so an admin can see the
                         email in their own inbox without spamming users.
                         → Safe by default. You must opt IN to live sending.

     EMAIL_TEST_RECIPIENTS — comma-separated allowlist used as the redirect
                         target in safe mode. Falls back to the sending
                         admin's own email when unset.

     EMAIL_MAX_RECIPIENTS — hard cap on a single live campaign (default
                         1000). A campaign resolving to more than this is
                         blocked with a clear error rather than sent, so a
                         mis-scoped audience can't blast the whole user base.

   Nothing here sends — it only validates + decides targets. The action
   layer performs the actual Resend call against the plan we return.
   ───────────────────────────────────────────────────────────────────────── */

export const SAFE_MODE_SAMPLE_LIMIT = 3;

export type EmailSafetyConfig = {
  safeMode: boolean;
  testRecipients: string[];
  maxRecipients: number;
  apiConfigured: boolean;
};

export function getEmailSafetyConfig(adminEmail?: string | null): EmailSafetyConfig {
  const safeMode = process.env.EMAIL_SAFE_MODE !== "off";
  const maxRecipients = clampInt(process.env.EMAIL_MAX_RECIPIENTS, 1000, 1, 100_000);

  const allowlist = (process.env.EMAIL_TEST_RECIPIENTS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => isValidEmail(s));

  const testRecipients =
    allowlist.length > 0
      ? allowlist
      : adminEmail && isValidEmail(adminEmail)
        ? [adminEmail]
        : [];

  return {
    safeMode,
    testRecipients,
    maxRecipients,
    apiConfigured: Boolean(process.env.RESEND_API_KEY),
  };
}

/** RFC-lite email shape check — good enough to reject obvious garbage
 *  before we hand an address to Resend. */
export function isValidEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/* ── Pre-send content validation ──────────────────────────────────────── */

export type ContentCheck = { ok: true } | { ok: false; error: string };

export function validateSendContent(subject: string, body: string): ContentCheck {
  if (!subject.trim()) return { ok: false, error: "Subject is required before sending." };
  if (!body.trim()) return { ok: false, error: "Message body is required before sending." };
  if (subject.length > 300) return { ok: false, error: "Subject is too long (max 300 characters)." };
  return { ok: true };
}

/* ── Send-target planning ─────────────────────────────────────────────── */

export type Recipient = {
  id: string;
  email: string;
  full_name: string | null;
  plan: string | null;
};

export type SendPlan =
  | {
      ok: true;
      mode: "live" | "safe";
      /** The addresses we will actually deliver to. In safe mode these are
       *  the test inbox(es); in live mode the real (validated, capped) list. */
      targets: Recipient[];
      /** Full resolved audience size — what a live send WOULD reach. Used for
       *  the History row's recipients_total so the log stays honest. */
      audienceTotal: number;
      /** Subject prefix to make safe-mode/test sends unmistakable. */
      subjectPrefix: string;
      /** Optional banner prepended to the body in safe mode. */
      bodyBanner: string | null;
      /** Human notice surfaced back to the admin UI. */
      notice: string | null;
    }
  | { ok: false; error: string };

/**
 * Decide who actually receives an admin campaign, applying all safety rails.
 *
 * @param resolved  the real audience (already de-duped, emails validated upstream)
 * @param adminEmail the sending admin's address (safe-mode fallback target)
 */
export function planCampaignSend(
  resolved: Recipient[],
  adminEmail: string | null | undefined,
): SendPlan {
  const cfg = getEmailSafetyConfig(adminEmail);

  if (!cfg.apiConfigured) {
    return {
      ok: false,
      error:
        "Email backend not configured (RESEND_API_KEY missing). Add the key in your environment to enable sending.",
    };
  }

  // Validate + de-dupe the resolved audience.
  const valid = dedupeByEmail(resolved.filter((r) => isValidEmail(r.email)));
  if (valid.length === 0) {
    return { ok: false, error: "No valid recipients for this audience." };
  }

  if (cfg.safeMode) {
    if (cfg.testRecipients.length === 0) {
      return {
        ok: false,
        error:
          "Safe mode is on but no test recipient is available. Set EMAIL_TEST_RECIPIENTS or sign in with a valid email.",
      };
    }
    // Send a small sample to the test inbox(es), personalised from the first
    // real recipients, so the admin previews real output without mass send.
    const sample = valid.slice(0, SAFE_MODE_SAMPLE_LIMIT);
    const targets: Recipient[] = [];
    for (const test of cfg.testRecipients) {
      for (const r of sample) {
        targets.push({ ...r, email: test });
      }
    }
    return {
      ok: true,
      mode: "safe",
      targets,
      audienceTotal: valid.length,
      subjectPrefix: "[SAFE MODE] ",
      bodyBanner:
        `⚠️ SAFE MODE — this is a redirected preview. A live send would reach ` +
        `${valid.length} recipient(s). Set EMAIL_SAFE_MODE=off (with a verified domain) to send for real.\n\n`,
      notice:
        `Safe mode is ON. Sent a ${sample.length}-recipient preview to your test inbox instead of ` +
        `emailing ${valid.length} real recipient(s).`,
    };
  }

  // Live mode — enforce the hard cap.
  if (valid.length > cfg.maxRecipients) {
    return {
      ok: false,
      error:
        `This campaign resolves to ${valid.length} recipients, above the ${cfg.maxRecipients} ` +
        `safety cap. Narrow the audience or raise EMAIL_MAX_RECIPIENTS to proceed.`,
    };
  }

  return {
    ok: true,
    mode: "live",
    targets: valid,
    audienceTotal: valid.length,
    subjectPrefix: "",
    bodyBanner: null,
    notice: null,
  };
}

/* ── helpers ──────────────────────────────────────────────────────────── */

function dedupeByEmail(list: Recipient[]): Recipient[] {
  const seen = new Set<string>();
  const out: Recipient[] = [];
  for (const r of list) {
    const key = r.email.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r);
  }
  return out;
}

function clampInt(raw: string | undefined, fallback: number, min: number, max: number): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(n)));
}
