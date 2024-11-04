// src/middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT, getJWTFromCookies } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Skip middleware for API routes and unauthorized page
  if (path.startsWith("/api") || path.includes("/unauthorized")) {
    return NextResponse.next();
  }

  // Allow public access to root (login page)
  if (path === "/") {
    // If user is already logged in, redirect to dashboard
    try {
      const token = await getJWTFromCookies(request);
      if (token) {
        await verifyJWT(token);
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
    } catch {
      // If token verification fails, let them access login page
      return NextResponse.next();
    }
    return NextResponse.next();
  }

  // Protect all routes under /admin
  if (path.startsWith("/admin")) {
    try {
      const token = await getJWTFromCookies(request);

      if (!token) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }

      // Verify token
      await verifyJWT(token);
      return NextResponse.next();
    } catch {
      // Clear invalid token and redirect
      const response = NextResponse.redirect(
        new URL("/unauthorized", request.url)
      );
      response.cookies.delete("admin-token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
