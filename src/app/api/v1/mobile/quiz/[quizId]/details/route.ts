// src/app/api/v1/mobile/quiz/[quizId]/details/route.ts

import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
import { ApiError } from "@/lib/errors";
import { getQuizById } from "@/services/quizService";
import { getStudentPgAnswers } from "@/services/jawabanPgService";
import { getStudentEssayAnswers } from "@/services/jawabanEssayService";
import { AUTH_CONFIG } from "@/config/auth";

type RouteContext = {
  params: Promise<{ quizId: string }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { quizId } = await context.params;
    
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      throw new ApiError("UNAUTHORIZED", "Token tidak valid", 401);
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyJWT(token);

    const deviceId = request.headers.get(AUTH_CONFIG.mobile.deviceIdHeader);
    if (AUTH_CONFIG.mobile.requiredForMobile && !deviceId) {
      throw new ApiError("UNAUTHORIZED", "Device ID diperlukan", 401);
    }

    // Get quiz details first
    const quiz = await getQuizById(quizId);
    if (!quiz) {
      throw new ApiError("NOT_FOUND", "Quiz tidak ditemukan", 404);
    }

    // Get student's answers based on quiz type
    const answers = quiz.type === 'MULTIPLE_CHOICE'
      ? await getStudentPgAnswers(payload.sub, quizId)
      : await getStudentEssayAnswers(payload.sub, quizId);

    // Calculate scores
    const totalAnswered = answers.length;
    const avgScore = totalAnswered > 0
      ? answers.reduce((acc, ans) => acc + (ans.nilai || 0), 0) / totalAnswered
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        quiz: {
          id: quiz.id,
          judul: quiz.judul,
          type: quiz.type,
          materiId: quiz.materiId
        },
        answers: answers.map(ans => ({
          id: ans.id,
          pertanyaan: ans.soalRef.pertanyaan,
          jawaban: ans.jawaban,
          nilai: ans.nilai,
          feedback: 'feedback' in ans ? ans.feedback : undefined,
          isCorrect: 'isCorrect' in ans ? ans.isCorrect : undefined
        })),
        summary: {
          totalAnswered,
          avgScore,
          isComplete: quiz.type === 'MULTIPLE_CHOICE' ? true :
            answers.every(ans => ans.nilai !== null)
        }
      }
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

