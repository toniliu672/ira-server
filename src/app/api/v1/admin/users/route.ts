// src/app/api/v1/admin/users/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createUser, getUsers } from "@/services/adminUserService";
import { SortField, userSchema } from "@/types/user";
import { ApiError } from "@/lib/errors";
import { verifyJWT } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

// Rate limiter untuk admin API
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

// GET /api/v1/admin/users - List users dengan filtering dan pagination
export async function GET(req: NextRequest) {
  try {
    // Rate limiting
    await limiter.check(req, 60);

    // Verifikasi admin token dari cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("admin-token")?.value;

    if (!token) {
      throw new ApiError("UNAUTHORIZED", "Token tidak ditemukan", 401);
    }

    const payload = await verifyJWT(token);
    if (payload.role !== "admin") {
      throw new ApiError("FORBIDDEN", "Akses ditolak", 403);
    }

    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = (searchParams.get("sortBy") || "createdAt") as SortField;
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const activeOnly = searchParams.get("activeOnly") === "true";

    const result = await getUsers({
      search,
      page,
      limit,
      sortBy: sortBy,
      sortOrder: sortOrder as "asc" | "desc",
      activeOnly,
    });

    return NextResponse.json({
      success: true,
      message: "Berhasil mengambil data users",
      data: result,
    });
  } catch (e) {
    if (e instanceof ApiError) {
      return NextResponse.json(
        {
          success: false,
          message: e.message,
          error: e.code,
        },
        { status: e.status }
      );
    }

    console.error("Admin Get Users Error:", e);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan internal",
        error: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}

// POST /api/v1/admin/users - Create new user
export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    await limiter.check(req, 30);

    // Verifikasi admin token dari cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("admin-token")?.value;

    if (!token) {
      throw new ApiError("UNAUTHORIZED", "Token tidak ditemukan", 401);
    }

    const payload = await verifyJWT(token);
    if (payload.role !== "admin") {
      throw new ApiError("FORBIDDEN", "Akses ditolak", 403);
    }

    // Validate CSRF token
    const csrfToken = req.headers.get("X-CSRF-Token");
    const storedCsrfToken = cookieStore.get("csrf-token")?.value;

    if (!csrfToken || !storedCsrfToken || csrfToken !== storedCsrfToken) {
      throw new ApiError("FORBIDDEN", "Invalid CSRF token", 403);
    }

    const body = await req.json();

    // Validasi input
    const validatedData = userSchema.parse(body);

    const user = await createUser(validatedData);

    return NextResponse.json(
      {
        success: true,
        message: "Berhasil membuat user baru",
        data: user,
      },
      { status: 201 }
    );
  } catch (e) {
    if (e instanceof ApiError) {
      return NextResponse.json(
        {
          success: false,
          message: e.message,
          error: e.code,
        },
        { status: e.status }
      );
    }

    console.error("Admin Create User Error:", e);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan internal",
        error: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
