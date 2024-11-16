// src/app/api/v1/admin/materi/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { verifyJWT } from "@/lib/auth";
import { materiSchema } from "@/types/materi";
import { createMateri, getMateri } from "@/services/materiService";
import { ApiError } from "@/lib/errors";
import { rateLimit } from "@/lib/rate-limit";

// Cache tags
const CACHE_TAGS = {
  MATERI_LIST: 'materi-list',
  MATERI_STATS: 'materi-stat'
} as const;

// Rate limiting config
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500
});

export async function GET(req: NextRequest) {
  try {
    await limiter.check(req, 60); // 60 requests per minute

    // Auth check
    const cookieStore = await cookies();
    const token = cookieStore.get("admin-token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Token tidak ditemukan",
          error: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(token);
    if (payload.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Akses ditolak",
          error: "FORBIDDEN",
        },
        { status: 403 }
      );
    }

    // Get query parameters with defaults
    const searchParams = req.nextUrl.searchParams;
    const filters = {
      search: searchParams.get("search") || "",
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "10"),
      sortBy: (searchParams.get("sortBy") || "urutan") as "judul" | "urutan" | "createdAt",
      sortOrder: (searchParams.get("sortOrder") || "asc") as "asc" | "desc",
      status: searchParams.get("status") === "true" ? true : undefined
    };

    // Get data with caching at the service layer
    const result = await getMateri(filters);

    return NextResponse.json({
      success: true,
      message: "Berhasil mengambil data materi",
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
    console.error("Admin Get Materi List Error:", e);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await limiter.check(req, 30); // 30 creates per minute

    // Auth check
    const cookieStore = await cookies();
    const token = cookieStore.get("admin-token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Token tidak ditemukan",
          error: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(token);
    if (payload.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Akses ditolak",
          error: "FORBIDDEN",
        },
        { status: 403 }
      );
    }

    // Validate CSRF token
    const csrfToken = req.headers.get("x-csrf-token");
    const storedCsrfToken = cookieStore.get("csrf-token")?.value;

    if (!csrfToken || !storedCsrfToken || csrfToken !== storedCsrfToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid CSRF token",
          error: "FORBIDDEN",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = materiSchema.parse(body);

    const materi = await createMateri(validatedData, payload.sub);

    // Revalidate cache
    revalidateTag(CACHE_TAGS.MATERI_LIST);
    revalidateTag(CACHE_TAGS.MATERI_STATS);

    return NextResponse.json(
      {
        success: true,
        message: "Berhasil membuat materi",
        data: materi,
      },
      { status: 201 }
    );
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Validasi gagal",
          error: "VALIDATION_ERROR", 
          details: e.errors,
        },
        { status: 400 }
      );
    }

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

    console.error("Admin Create Materi Error:", e);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}