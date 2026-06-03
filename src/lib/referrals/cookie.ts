/**
 * Shared constants/helpers for the referral-attribution cookie.
 *
 * When a visitor lands via someone's referral link (`?ref=CODE`), `proxy.ts`
 * stores the sanitized code in this cookie so attribution survives navigation
 * (a homepage hop, clicking "sign in instead", a refresh) and is still present
 * at sign-up even if the query param gets dropped along the way. Both the
 * sign-up page and the sign-up server action read it; the action clears it once
 * the referral is linked so it can't bleed into a later, unrelated signup on
 * the same browser.
 *
 * Keep this module free of server-only imports — `proxy.ts` runs in the proxy
 * runtime and only needs the pure constants + sanitizer here.
 */

export const REF_COOKIE = "ref_code";

/** 30 days — long enough to cover "click the link now, sign up later". */
export const REF_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

/**
 * Referral codes are lowercase alphanumeric (see `generate_referral_code()` in
 * 0027_referrals.sql). Strip anything else and cap the length so a hostile or
 * malformed `?ref` value can't smuggle junk into a cookie or a DB lookup.
 * Returns `null` when nothing usable remains.
 */
export function sanitizeReferralCode(
  raw: string | null | undefined,
): string | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[^a-z0-9]/gi, "").toLowerCase().slice(0, 16);
  return cleaned || null;
}
