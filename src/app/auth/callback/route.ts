import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { APP_ROUTES } from "@/lib/constants";

/**
 * Auth callback route handler
 *
 * This route handles redirects from Supabase for:
 * - Email confirmation after signup
 * - Password reset links
 * - OAuth callbacks
 *
 * Supabase sends a code that we exchange for a session.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? APP_ROUTES.DASHBOARD;
  const type = searchParams.get("type");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Handle different auth types
      if (type === "recovery") {
        // Password reset flow - redirect to reset password page
        return NextResponse.redirect(`${origin}${APP_ROUTES.AUTH.RESET_PASSWORD}`);
      }

      // Default: redirect to the next page (usually dashboard)
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If there's an error or no code, redirect to login with error
  return NextResponse.redirect(`${origin}${APP_ROUTES.AUTH.LOGIN}?error=auth_callback_error`);
}
