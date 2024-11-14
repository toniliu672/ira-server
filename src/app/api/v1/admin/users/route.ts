// src/app/api/v1/admin/users/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createUser, getUsers } from "@/services/adminUserService";
import { SortField, userSchema } from "@/types/user";
import { ApiError } from "@/lib/errors";
import { verifyJWT } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});

export async function GET(req: NextRequest) {
  try {
    await limiter.check(req, 60);

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

    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = (searchParams.get("sortBy") as SortField) || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const activeOnly = searchParams.get("activeOnly") === "true";

    const result = await getUsers({
      search,
      page,
      limit,
      sortBy,
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
        message: "Internal server error",
        error: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await limiter.check(req, 30);

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

    const body = await req.json();
    const validatedData = userSchema.parse(body);

    const user = await createUser(validatedData);

    return NextResponse.json(
      {
        success: true,
        message: "Berhasil membuat user",
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
        message: "Internal server error",
        error: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
