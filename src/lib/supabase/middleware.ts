import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { PUBLIC_ROUTES, APP_ROUTES } from "@/lib/constants";

/**
 * Updates the Supabase session and handles auth redirects
 * Called from middleware to refresh tokens and protect routes
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Check if the current route is public
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  // Special handling for reset password - allow access if there's a recovery session
  // The reset password page needs the user to be partially authenticated (with recovery token)
  const isResetPasswordPage = pathname === APP_ROUTES.AUTH.RESET_PASSWORD;

  // If user is not authenticated and trying to access a protected route
  if (!user && !isPublicRoute && pathname !== "/") {
    const url = request.nextUrl.clone();
    url.pathname = APP_ROUTES.AUTH.LOGIN;
    return NextResponse.redirect(url);
  }

  // If user is authenticated and trying to access auth pages (except reset password)
  // Reset password needs to be accessible when user has a recovery session
  if (user && isPublicRoute && !isResetPasswordPage) {
    const url = request.nextUrl.clone();
    url.pathname = APP_ROUTES.DASHBOARD;
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
