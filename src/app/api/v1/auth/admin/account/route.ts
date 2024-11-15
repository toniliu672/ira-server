// src/app/api/v1/auth/admin/account/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { revalidateTag } from "next/cache";
import { unstable_cache } from "next/cache";
import { getAdmins, createAdmin } from "@/services/adminService";
import { verifyJWT } from "@/lib/auth";
import { ApiError, ErrorCode } from "@/lib/errors";
import { rateLimit } from "@/lib/rate-limit";
import type { AdminFilters, SortField } from "@/types/admin";

const CACHE_TAG_ADMINS = "admins";
const REVALIDATE_INTERVAL = 60; // 1 minute

// Rate limiter for admin routes
const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});

// Cache configuration
const cacheConfig = {
  tags: [CACHE_TAG_ADMINS],
  revalidate: REVALIDATE_INTERVAL,
};

// Cached getAdmins function with proper typing
const getCachedAdmins = unstable_cache(
  async (filters: AdminFilters) => {
    return await getAdmins(filters);
  },
  ["admins-list"],
  cacheConfig
);

export async function GET(request: NextRequest) {
  try {
    await limiter.check(request, 60);

    const cookieStore = await cookies();
    const token = cookieStore.get("admin-token")?.value;

    if (!token) {
      throw new ApiError(ErrorCode.UNAUTHORIZED, "Token tidak ditemukan", 401);
    }

    const payload = await verifyJWT(token);
    if (payload.role !== "admin") {
      throw new ApiError(ErrorCode.FORBIDDEN, "Akses ditolak", 403);
    }

    // Get query parameters with defaults
    const searchParams = request.nextUrl.searchParams;
    const sortByParam = searchParams.get("sortBy") as SortField | null;

    // Ensure sortBy is a valid SortField
    const filters: AdminFilters = {
      search: searchParams.get("search") || "",
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || 10,
      sortBy:
        sortByParam &&
        ["username", "name", "email", "createdAt"].includes(sortByParam)
          ? sortByParam
          : "createdAt",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
    };

    // Get cached data
    const data = await getCachedAdmins(filters);

    return NextResponse.json({
      success: true,
      data,
      message: "Data admin berhasil diambil",
    });
  } catch (e) {
    if (e instanceof ApiError) {
      return NextResponse.json(
        {
          success: false,
          error: e.message,
        },
        { status: e.status }
      );
    }

    console.error("GET Admin Error:", e);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await limiter.check(request, 30);

    const cookieStore = await cookies();
    const token = cookieStore.get("admin-token")?.value;

    if (!token) {
      throw new ApiError(ErrorCode.UNAUTHORIZED, "Token tidak ditemukan", 401);
    }

    const payload = await verifyJWT(token);
    if (payload.role !== "admin") {
      throw new ApiError(ErrorCode.FORBIDDEN, "Akses ditolak", 403);
    }

    // Validate CSRF
    const csrfToken = request.headers.get("X-CSRF-Token");
    const storedCsrfToken = cookieStore.get("csrf-token")?.value;

    if (!csrfToken || !storedCsrfToken || csrfToken !== storedCsrfToken) {
      throw new ApiError(ErrorCode.FORBIDDEN, "Invalid CSRF token", 403);
    }

    const body = await request.json();
    const admin = await createAdmin(body);

    // Revalidate cache after creating new admin
    revalidateTag(CACHE_TAG_ADMINS);

    return NextResponse.json({
      success: true,
      data: admin,
      message: "Admin berhasil dibuat",
    });
  } catch (e) {
    if (e instanceof ApiError) {
      return NextResponse.json(
        {
          success: false,
          error: e.message,
        },
        { status: e.status }
      );
    }

    if (e instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: e.errors,
        },
        { status: 400 }
      );
    }

    console.error("POST Admin Error:", e);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
