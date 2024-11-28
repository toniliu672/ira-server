// src/app/api/v1/mobile/quiz/[quizId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
import { ApiError } from "@/lib/errors";
import { getQuizById } from "@/services/quizService";
import { getRandomSoalPg } from "@/services/soalPgService";
import { getSoalEssayByQuizId } from "@/services/soalEssayService";
import { AUTH_CONFIG } from "@/config/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      throw new ApiError("UNAUTHORIZED", "Token tidak valid", 401);
    }

    // Extract and verify JWT
    const token = authHeader.split(' ')[1];
    const payload = await verifyJWT(token);

    // Verify device ID if required
    const deviceId = request.headers.get(AUTH_CONFIG.mobile.deviceIdHeader);
    if (AUTH_CONFIG.mobile.requiredForMobile && !deviceId) {
      throw new ApiError("UNAUTHORIZED", "Device ID diperlukan", 401);
    }

    // Get quiz
    const quiz = await getQuizById(params.quizId);
    
    // Get questions based on quiz type
    let questions;
    if (quiz.type === 'MULTIPLE_CHOICE') {
      questions = await getRandomSoalPg(params.quizId, 10); // Get 10 random PG questions
    } else {
      questions = await getSoalEssayByQuizId(params.quizId, true); // Get all active essay questions
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