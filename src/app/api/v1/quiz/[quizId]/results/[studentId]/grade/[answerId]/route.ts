// src/app/api/v1/quiz/[quizId]/results/[studentId]/grade/[answerId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth";
import { ApiError } from "@/lib/errors";
import { getQuizById } from "@/services/quizService";
import { updateNilaiEssay } from "@/services/jawabanEssayService";

type RouteContext = {
  params: Promise<{ quizId: string; studentId: string; answerId: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { quizId, answerId } = await context.params;

    // Auth check
    const cookieStore = await cookies();
    const token = cookieStore.get("admin-token")?.value;

    if (!token) {
      throw new ApiError("UNAUTHORIZED", "Unauthorized", 401);
    }

    await verifyJWT(token);

    // CSRF check
    const csrfToken = request.headers.get("X-CSRF-Token");
    const storedCsrfToken = cookieStore.get("csrf-token")?.value;

    if (!csrfToken || !storedCsrfToken || csrfToken !== storedCsrfToken) {
      throw new ApiError("FORBIDDEN", "Invalid CSRF token", 403);
    }

    // Verify quiz exists and is essay type
    const quiz = await getQuizById(quizId);
    if (!quiz) {
      throw new ApiError("NOT_FOUND", "Quiz tidak ditemukan", 404);
    }

    if (quiz.type !== "ESSAY") {
      throw new ApiError(
        "INVALID_OPERATION",
        "Hanya quiz essay yang dapat dinilai",
        400
      );
    }

    // Get and validate request body
    const body = await request.json();
    const { nilai, feedback } = body;

    if (typeof nilai !== "number" || nilai < 0 || nilai > 100) {
      throw new ApiError(
        "VALIDATION_ERROR",
        "Nilai harus berupa angka antara 0-100",
        400
      );
    }

    // Update nilai
    const jawaban = await updateNilaiEssay(answerId, nilai, feedback);

    return NextResponse.json({
      success: true,
      data: jawaban,
      message: "Nilai berhasil disimpan",
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