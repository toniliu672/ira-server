// src/app/api/v1/mobile/quiz/[quizId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
import { ApiError } from "@/lib/errors";
import { getQuizById } from "@/services/quizService";
import { getSoalPgByQuizId } from "@/services/soalPgService";
import { getSoalEssayByQuizId } from "@/services/soalEssayService";
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
    await verifyJWT(token);

    const deviceId = request.headers.get(AUTH_CONFIG.mobile.deviceIdHeader);
    if (AUTH_CONFIG.mobile.requiredForMobile && !deviceId) {
      throw new ApiError("UNAUTHORIZED", "Device ID diperlukan", 401);
    }

    const quiz = await getQuizById(quizId);
    if (!quiz) {
      throw new ApiError("NOT_FOUND", "Quiz tidak ditemukan", 404);
    }
    
    let questions;
    if (quiz.type === 'MULTIPLE_CHOICE') {
      questions = await getSoalPgByQuizId(quizId, true);
    } else {
      questions = await getSoalEssayByQuizId(quizId, true);
    }

    return NextResponse.json({
      success: true,
      data: {
        quiz,
        questions
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