import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "kanban_session";
const AUTH_PATHS = ["/login", "/register", "/forgot-password"];
// Reachable regardless of session state — a reset link must work whether or not this
// browser also happens to have a (possibly stale) session cookie.
const PUBLIC_PATHS = ["/reset-password"];

/**
 * Optimistic redirect only — the cookie is a non-sensitive client-set flag,
 * not a verified session. Real authorization always happens on the backend.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);

  if (pathname === "/") {
    return NextResponse.redirect(new URL(hasSession ? "/dashboard" : "/login", request.url));
  }

  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const isAuthPath = AUTH_PATHS.some((path) => pathname.startsWith(path));

  if (isAuthPath && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!isAuthPath && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/employees/:path*",
    "/tasks/:path*",
    "/settings/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
};
