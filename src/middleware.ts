// src/middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT, getJWTFromCookies } from "@/lib/auth";
import { cookies } from "next/headers";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Skip middleware for API routes and unauthorized page
  if (path.includes("/unauthorized")) {
    return NextResponse.next();
  }

  // CSRF Protection untuk API routes
  if (path.startsWith("/api/v1") && !path.startsWith("/api/v1/mobile")) {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
      const csrfToken = request.headers.get('x-csrf-token');
      const cookieStore = cookies();
      const storedToken = (await cookieStore).get('csrf-token')?.value;

      if (!csrfToken || !storedToken || csrfToken !== storedToken) {
        return new NextResponse(
          JSON.stringify({ 
            success: false, 
            error: "Invalid CSRF token" 
          }), 
          { 
            status: 403,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }
    }
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
    "/api/v1/:path*",
  ],
};