import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
import { ApiError } from "@/lib/errors";
import { getQuizById } from "@/services/quizService";
import { getSoalPgByQuizId } from "@/services/soalPgService"; // Changed import
import { getSoalEssayByQuizId } from "@/services/soalEssayService";
import { AUTH_CONFIG } from "@/config/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      throw new ApiError("UNAUTHORIZED", "Token tidak valid", 401);
    }

    const token = authHeader.split(' ')[1];
    await verifyJWT(token); // Remove unused variable

    const deviceId = request.headers.get(AUTH_CONFIG.mobile.deviceIdHeader);
    if (AUTH_CONFIG.mobile.requiredForMobile && !deviceId) {
      throw new ApiError("UNAUTHORIZED", "Device ID diperlukan", 401);
    }

    const quiz = await getQuizById(params.quizId);
    
    let questions;
    if (quiz.type === 'MULTIPLE_CHOICE') {
      questions = await getSoalPgByQuizId(params.quizId, true); // Changed to use available function
    } else {
      questions = await getSoalEssayByQuizId(params.quizId, true);
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
