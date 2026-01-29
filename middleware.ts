import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple cookie check for admin dashboard (session cookie set by API)
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin app routes (not static files)
  if (pathname === "/" || pathname.startsWith("/students") || pathname.startsWith("/teachers") ||
      pathname.startsWith("/matches") || pathname.startsWith("/transactions") ||
      pathname.startsWith("/schedule") || pathname.startsWith("/payouts") ||
      pathname.startsWith("/performance") || pathname.startsWith("/site-insights") ||
      pathname.startsWith("/ratings") || pathname.startsWith("/settings") ||
      pathname.startsWith("/help")) {
    const session = request.cookies.get("tutorconnect_session");
    if (!session?.value) {
      const loginUrl = new URL("/login.html", request.url);
      loginUrl.searchParams.set("from", pathname || "admin");
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/students/:path*",
    "/teachers/:path*",
    "/matches/:path*",
    "/transactions/:path*",
    "/schedule/:path*",
    "/payouts/:path*",
    "/performance/:path*",
    "/site-insights/:path*",
    "/ratings/:path*",
    "/settings/:path*",
    "/help/:path*",
  ],
};
