import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import {
  REF_COOKIE,
  REF_COOKIE_MAX_AGE,
  sanitizeReferralCode,
} from "@/lib/referrals/cookie";

export async function proxy(request: NextRequest) {
  const response = await updateSession(request);

  // Persist a referral code from `?ref=` so attribution survives navigation
  // and is still available at sign-up if the query param is later dropped
  // (homepage hop, "sign in instead", refresh). We only ever SET here — the
  // sign-up action clears it once a referral is linked. Setting on whatever
  // response updateSession returned covers both the pass-through and the auth
  // redirect cases. The equality guard avoids re-emitting an identical
  // Set-Cookie on every matched request.
  const ref = sanitizeReferralCode(request.nextUrl.searchParams.get("ref"));
  if (ref && request.cookies.get(REF_COOKIE)?.value !== ref) {
    response.cookies.set(REF_COOKIE, ref, {
      maxAge: REF_COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Run on every request except:
     * - Next.js internals (_next/static, _next/image)
     * - Favicon and static assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
