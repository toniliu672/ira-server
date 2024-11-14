import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getUserById,
  updateUser,
  deleteUser,
} from "@/services/adminUserService";
import { userUpdateSchema } from "@/types/user";
import { ApiError } from "@/lib/errors";
import { verifyJWT } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    await limiter.check(request, 60);

    const cookieStore = await cookies();
    const token = cookieStore.get("admin-token")?.value;

    if (!token) {
      throw new ApiError("UNAUTHORIZED", "Token tidak ditemukan", 401);
    }

    const payload = await verifyJWT(token);
    if (payload.role !== "admin") {
      throw new ApiError("FORBIDDEN", "Akses ditolak", 403);
    }

    const { id } = await context.params;
    const user = await getUserById(id);

    return NextResponse.json({
      success: true,
      message: "Berhasil mengambil data user",
      data: user,
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
    console.error("Admin Get User Detail Error:", e);
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

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    await limiter.check(request, 30);

    const cookieStore = await cookies();
    const token = cookieStore.get("admin-token")?.value;

    if (!token) {
      throw new ApiError("UNAUTHORIZED", "Token tidak ditemukan", 401);
    }

    const payload = await verifyJWT(token);
    if (payload.role !== "admin") {
      throw new ApiError("FORBIDDEN", "Akses ditolak", 403);
    }

    // Validate CSRF
    const csrfToken = request.headers.get("X-CSRF-Token");
    const storedCsrfToken = cookieStore.get("csrf-token")?.value;

    if (!csrfToken || !storedCsrfToken || csrfToken !== storedCsrfToken) {
      throw new ApiError("FORBIDDEN", "Invalid CSRF token", 403);
    }

    const { id } = await context.params;
    const body = await request.json();
    const validatedData = userUpdateSchema.parse(body);

    const user = await updateUser(id, validatedData);

    return NextResponse.json({
      success: true,
      message: "Berhasil mengupdate user",
      data: user,
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
    console.error("Admin Update User Error:", e);
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

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    await limiter.check(request, 20);

    const cookieStore = await cookies();
    const token = cookieStore.get("admin-token")?.value;

    if (!token) {
      throw new ApiError("UNAUTHORIZED", "Token tidak ditemukan", 401);
    }

    const payload = await verifyJWT(token);
    if (payload.role !== "admin") {
      throw new ApiError("FORBIDDEN", "Akses ditolak", 403);
    }

    // Validate CSRF
    const csrfToken = request.headers.get("X-CSRF-Token");
    const storedCsrfToken = cookieStore.get("csrf-token")?.value;

    if (!csrfToken || !storedCsrfToken || csrfToken !== storedCsrfToken) {
      throw new ApiError("FORBIDDEN", "Invalid CSRF token", 403);
    }

    const { id } = await context.params;
    await deleteUser(id);

    return NextResponse.json({
      success: true,
      message: "Berhasil menghapus user",
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
    console.error("Admin Delete User Error:", e);
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