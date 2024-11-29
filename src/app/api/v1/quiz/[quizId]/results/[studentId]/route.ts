// src/app/api/v1/quiz/[quizId]/results/[studentId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth";
import { ApiError } from "@/lib/errors";
import { getQuizById } from "@/services/quizService";
import { getStudentPgAnswers } from "@/services/jawabanPgService";
import { getStudentEssayAnswers } from "@/services/jawabanEssayService";

type RouteContext = {
  params: Promise<{ quizId: string; studentId: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { quizId, studentId } = await context.params;

    // Auth check
    const cookieStore = await cookies();
    const token = cookieStore.get("admin-token")?.value;

    if (!token) {
      throw new ApiError("UNAUTHORIZED", "Unauthorized", 401);
    }

    await verifyJWT(token);

    // Get quiz details
    const quiz = await getQuizById(quizId);
    if (!quiz) {
      throw new ApiError("NOT_FOUND", "Quiz tidak ditemukan", 404);
    }

    // Get student answers based on quiz type
    const answers =
      quiz.type === "MULTIPLE_CHOICE"
        ? await getStudentPgAnswers(studentId, quizId)
        : await getStudentEssayAnswers(studentId, quizId);

    return NextResponse.json({
      success: true,
      data: {
        quiz: {
          id: quiz.id,
          judul: quiz.judul,
          type: quiz.type,
        },
        answers,
      },
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
