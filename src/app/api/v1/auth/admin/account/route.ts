// src/app/api/v1/auth/admin/account/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { verifyJWT } from "@/lib/auth";
import { getAdmins, createAdmin } from "@/services/adminService";
import { ApiError, ErrorCode } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin-token")?.value;
    
    if (!token) {
      throw new ApiError(ErrorCode.UNAUTHORIZED, 'Unauthorized', 401);
    }

    const payload = await verifyJWT(token);
    if (payload.role !== "admin") {
      throw new ApiError(ErrorCode.FORBIDDEN, 'Forbidden', 403);
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const filters = {
      search: searchParams.get("search") || '',
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || 10,
      sortBy: (searchParams.get("sortBy") as "username" | "name" | "email" | "createdAt") || "createdAt",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc"
    };

    const data = await getAdmins(filters);

    return NextResponse.json({ 
      success: true,
      data,
      message: 'Data admin berhasil diambil'
    });
  } catch (e) {
    if (e instanceof ApiError) {
      return NextResponse.json(
        { 
          success: false,
          error: e.message 
        },
        { status: e.status }
      );
    }

    console.error('GET Admin Error:', e);
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error" 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin-token")?.value;
    
    if (!token) {
      throw new ApiError(ErrorCode.UNAUTHORIZED, 'Unauthorized', 401);
    }

    const payload = await verifyJWT(token);
    if (payload.role !== "admin") {
      throw new ApiError(ErrorCode.FORBIDDEN, 'Forbidden', 403);
    }

    // Validate CSRF
    const csrfToken = request.headers.get("X-CSRF-Token");
    const storedCsrfToken = cookieStore.get("csrf-token")?.value;

    if (!csrfToken || !storedCsrfToken || csrfToken !== storedCsrfToken) {
      throw new ApiError(ErrorCode.FORBIDDEN, 'Invalid CSRF token', 403);
    }

    const body = await request.json();
    const admin = await createAdmin(body);

    return NextResponse.json({
      success: true,
      data: admin,
      message: 'Admin berhasil dibuat'
    });
  } catch (e) {
    if (e instanceof ApiError) {
      return NextResponse.json(
        { 
          success: false,
          error: e.message 
        },
        { status: e.status }
      );
    }

    if (e instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: e.errors
        },
        { status: 400 }
      );
    }

    console.error('POST Admin Error:', e);
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error" 
      },
      { status: 500 }
    );
  }
}