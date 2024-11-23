// src/app/api/v1/materi/[materiId]/sub/[subId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { verifyJWT } from "@/lib/auth";
import {
  getSubMateriById,
  updateSubMateri,
  deleteSubMateri,
  reorderSubMateri,
} from "@/services/subMateriService";
import { ApiError } from "@/lib/errors";
import { subMateriSchema } from "@/types/materi";

export async function GET(
  request: NextRequest,
  { params }: { params: { materiId: string; subId: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin-token")?.value;

    if (!token) {
      throw new ApiError("UNAUTHORIZED", "Unauthorized", 401);
    }

    await verifyJWT(token);

    const subMateri = await getSubMateriById(params.subId);

    // Validate that subMateri belongs to the specified materi
    if (subMateri.materiId !== params.materiId) {
      throw new ApiError("NOT_FOUND", "Sub materi tidak ditemukan", 404);
    }

    return NextResponse.json({
      success: true,
      data: subMateri,
    });
  } catch (e) {
    if (e instanceof ApiError) {
      return NextResponse.json(
        { success: false, error: e.message },
        { status: e.status }
      );
    }
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { materiId: string; subId: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin-token")?.value;

    if (!token) {
      throw new ApiError("UNAUTHORIZED", "Unauthorized", 401);
    }

    await verifyJWT(token);

    // Validate CSRF
    const csrfToken = request.headers.get("X-CSRF-Token");
    const storedCsrfToken = cookieStore.get("csrf-token")?.value;

    if (!csrfToken || !storedCsrfToken || csrfToken !== storedCsrfToken) {
      throw new ApiError("FORBIDDEN", "Invalid CSRF token", 403);
    }

    const body = await request.json();

    // Check if this is a reorder operation
    if (body.orderedIds) {
      await reorderSubMateri(params.materiId, body.orderedIds);
      return NextResponse.json({
        success: true,
        message: "Urutan sub materi berhasil diupdate",
      });
    }

    const validatedData = subMateriSchema.partial().parse(body);

    const subMateri = await updateSubMateri(params.subId, validatedData);

    // Validate that subMateri belongs to the specified materi
    if (subMateri.materiId !== params.materiId) {
      throw new ApiError("NOT_FOUND", "Sub materi tidak ditemukan", 404);
    }

    return NextResponse.json({
      success: true,
      data: subMateri,
      message: "Sub materi berhasil diupdate",
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation error", details: e.errors },
        { status: 400 }
      );
    }
    if (e instanceof ApiError) {
      return NextResponse.json(
        { success: false, error: e.message },
        { status: e.status }
      );
    }
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { materiId: string; subId: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin-token")?.value;

    if (!token) {
      throw new ApiError("UNAUTHORIZED", "Unauthorized", 401);
    }

    await verifyJWT(token);

    // Validate CSRF
    const csrfToken = request.headers.get("X-CSRF-Token");
    const storedCsrfToken = cookieStore.get("csrf-token")?.value;

    if (!csrfToken || !storedCsrfToken || csrfToken !== storedCsrfToken) {
      throw new ApiError("FORBIDDEN", "Invalid CSRF token", 403);
    }

    const subMateri = await getSubMateriById(params.subId);

    // Validate that subMateri belongs to the specified materi
    if (subMateri.materiId !== params.materiId) {
      throw new ApiError("NOT_FOUND", "Sub materi tidak ditemukan", 404);
    }

    await deleteSubMateri(params.subId);

    return NextResponse.json({
      success: true,
      message: "Sub materi berhasil dihapus",
    });
  } catch (e) {
    if (e instanceof ApiError) {
      return NextResponse.json(
        { success: false, error: e.message },
        { status: e.status }
      );
    }
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
