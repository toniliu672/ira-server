// src/app/api/v1/quiz/[quizId]/soal-essay/[soalId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { verifyJWT } from "@/lib/auth";
import { 
  getSoalEssayById,
  updateSoalEssay,
  deleteSoalEssay
} from "@/services/soalEssayService";
import { ApiError } from "@/lib/errors";
import { soalEssaySchema } from "@/types/quiz";

export async function GET(
  request: NextRequest,
  { params }: { params: { quizId: string; soalId: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin-token")?.value;

    if (!token) {
      throw new ApiError("UNAUTHORIZED", "Unauthorized", 401);
    }

    await verifyJWT(token);

    const soalEssay = await getSoalEssayById(params.soalId);

    // Validate that soal belongs to the quiz
    if (soalEssay.quizId !== params.quizId) {
      throw new ApiError("NOT_FOUND", "Soal tidak ditemukan", 404);
    }

    return NextResponse.json({
      success: true,
      data: soalEssay
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
  { params }: { params: { quizId: string; soalId: string } }
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
    const validatedData = soalEssaySchema.partial().parse(body);
    
    const soalEssay = await updateSoalEssay(params.soalId, validatedData);

    // Validate that soal belongs to the quiz
    if (soalEssay.quizId !== params.quizId) {
      throw new ApiError("NOT_FOUND", "Soal tidak ditemukan", 404);
    }

    return NextResponse.json({
      success: true,
      data: soalEssay,
      message: "Soal essay berhasil diupdate"
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
  { params }: { params: { quizId: string; soalId: string } }
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

    // Verify soal belongs to quiz before deletion
    const soalEssay = await getSoalEssayById(params.soalId);
    if (soalEssay.quizId !== params.quizId) {
      throw new ApiError("NOT_FOUND", "Soal tidak ditemukan", 404);
    }

    await deleteSoalEssay(params.soalId);

    return NextResponse.json({
      success: true,
      message: "Soal essay berhasil dihapus"
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