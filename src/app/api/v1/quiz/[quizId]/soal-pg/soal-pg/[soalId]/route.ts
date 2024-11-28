// src/app/api/v1/quiz/[quizId]/soal-pg/[soalId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { verifyJWT } from "@/lib/auth";
import { 
  getSoalPgById,
  updateSoalPg,
  deleteSoalPg
} from "@/services/soalPgService";
import { ApiError } from "@/lib/errors";
import { soalPgSchema } from "@/types/quiz";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string; soalId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin-token")?.value;

    if (!token) {
      throw new ApiError("UNAUTHORIZED", "Unauthorized", 401);
    }

    await verifyJWT(token);

    const { quizId, soalId } = await params;
    const soalPg = await getSoalPgById(soalId);

    // Validate that soal belongs to the quiz
    if (soalPg.quizId !== quizId) {
      throw new ApiError("NOT_FOUND", "Soal tidak ditemukan", 404);
    }

    return NextResponse.json({
      success: true,
      data: soalPg
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
  { params }: { params: Promise<{ quizId: string; soalId: string }> }
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

    const { quizId, soalId } = await params;
    const body = await request.json();
    const validatedData = soalPgSchema.partial().parse(body);
    
    const soalPg = await updateSoalPg(soalId, validatedData);

    // Validate that soal belongs to the quiz
    if (soalPg.quizId !== quizId) {
      throw new ApiError("NOT_FOUND", "Soal tidak ditemukan", 404);
    }

    return NextResponse.json({
      success: true,
      data: soalPg,
      message: "Soal PG berhasil diupdate"
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
  { params }: { params: Promise<{ quizId: string; soalId: string }> }
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

    const { quizId, soalId } = await params;

    // Verify soal belongs to quiz before deletion
    const soalPg = await getSoalPgById(soalId);
    if (soalPg.quizId !== quizId) {
      throw new ApiError("NOT_FOUND", "Soal tidak ditemukan", 404);
    }

    await deleteSoalPg(soalId);

    return NextResponse.json({
      success: true,
      message: "Soal PG berhasil dihapus"
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