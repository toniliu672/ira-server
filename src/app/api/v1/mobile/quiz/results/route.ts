// src/app/api/v1/mobile/quiz/results/route.ts

import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
import { ApiError } from "@/lib/errors";
import { getQuizResults } from "@/services/quizResultService";
import { AUTH_CONFIG } from "@/config/auth";
import type { QuizType } from "@prisma/client";

interface QuizResultData {
  student: {
    id: string;
    username: string;
    name: string;
  };
  quiz: {
    id: string;
    title: string;
    type: QuizType;
  };
  scores: {
    answered: number;
    avgScore: number;
    isComplete: boolean;
  };
  submittedAt: Date | null;
}

interface MobileQuizResult {
  quizId: string;
  quizTitle: string;
  type: QuizType;
  score: number;
  progress: {
    completed: number;
    isComplete: boolean;
    lastSubmitted: string | null;
  };
}

export async function GET(request: NextRequest) {
  try {
    // Auth validation
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      throw new ApiError("UNAUTHORIZED", "Token tidak valid", 401);
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyJWT(token);

    // Device ID validation
    const deviceId = request.headers.get(AUTH_CONFIG.mobile.deviceIdHeader);
    if (AUTH_CONFIG.mobile.requiredForMobile && !deviceId) {
      throw new ApiError("UNAUTHORIZED", "Device ID diperlukan", 401);
    }

    // Get optional filters from query params
    const searchParams = request.nextUrl.searchParams;
    const materiId = searchParams.get("materiId");
    const type = searchParams.get("type") as QuizType | undefined;
    
    if (!materiId) {
      throw new ApiError("BAD_REQUEST", "Materi ID diperlukan", 400);
    }

    // Get quiz results
    const { results } = await getQuizResults(materiId, {
      search: payload.sub,
      type,
      limit: 100,
      sortOrder: 'desc'
    });

    // Format results for mobile
    const formattedResults: MobileQuizResult[] = results.map((result: QuizResultData) => ({
      quizId: result.quiz.id,
      quizTitle: result.quiz.title,
      type: result.quiz.type,
      score: Math.round(result.scores.avgScore * 100) / 100,
      progress: {
        completed: result.scores.answered,
        isComplete: result.scores.isComplete,
        lastSubmitted: result.submittedAt ? new Date(result.submittedAt).toISOString() : null
      }
    }));

    // Sort by completion status and then by title
    const sortedResults = formattedResults.sort((a, b) => {
      if (a.progress.isComplete === b.progress.isComplete) {
        return a.quizTitle.localeCompare(b.quizTitle);
      }
      return a.progress.isComplete ? -1 : 1;
    });

    return NextResponse.json({
      success: true,
      data: sortedResults
    });

  } catch (e) {
    console.error("Mobile Quiz Results Error:", e);
    
    if (e instanceof ApiError) {
      return NextResponse.json(
        { success: false, error: e.message },
        { status: e.status }
      );
    }
    
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}