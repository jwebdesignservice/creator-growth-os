import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthRoute =
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/verify-email");
  const isAppRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/programs") ||
    pathname.startsWith("/tutorials") ||
    pathname.startsWith("/posting") ||
    pathname.startsWith("/missions") ||
    pathname.startsWith("/performance") ||
    pathname.startsWith("/community") ||
    pathname.startsWith("/monetization") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/billing") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/support") ||
    pathname.startsWith("/notifications") ||
    pathname.startsWith("/invoices") ||
    pathname.startsWith("/create-new") ||
    pathname.startsWith("/admin");

  if (!user && isAppRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("redirect", pathname);
    return redirectWithSession(url, response);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return redirectWithSession(url, response);
  }

  return response;
}

/**
 * Redirect while PRESERVING any auth cookies that `getUser()` refreshed onto
 * `fromResponse`. Returning a bare `NextResponse.redirect()` drops those
 * refreshed session cookies, which puts the browser and server out of sync and
 * logs the user out prematurely (the "random logout" bug). Copying the cookies
 * keeps the rotated access/refresh tokens in sync — per the Supabase SSR
 * contract: when returning a different response, carry the cookies over.
 */
function redirectWithSession(url: URL, fromResponse: NextResponse): NextResponse {
  const redirect = NextResponse.redirect(url);
  fromResponse.cookies.getAll().forEach((cookie) => {
    redirect.cookies.set(cookie);
  });
  return redirect;
}
