// src/app/api/v1/mobile/quiz/results/route.ts

import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
import { ApiError } from "@/lib/errors";
import { getQuizResults } from "@/services/quizResultService";
import { getQuizById } from "@/services/quizService";
import { AUTH_CONFIG } from "@/config/auth";

export async function GET(request: NextRequest) {
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const quizId = searchParams.get("quizId");
    
    if (!quizId) {
      throw new ApiError("BAD_REQUEST", "Quiz ID diperlukan", 400);
    }

    // Get quiz info first
    const quiz = await getQuizById(quizId);
    if (!quiz) {
      throw new ApiError("NOT_FOUND", "Quiz tidak ditemukan", 404);
    }

    // Get student's quiz results using studentId from JWT payload
    const results = await getQuizResults(quizId, {
      search: payload.sub, // Gunakan student ID sebagai search filter
      sortBy: "lastLogin",
      sortOrder: "desc",
      limit: 1 // Ambil hanya data siswa tersebut
    });

    // Format response khusus untuk mobile
    const studentResult = results.results[0];

    if (!studentResult) {
      return NextResponse.json({
        success: true,
        data: {
          quiz: {
            id: quiz.id,
            judul: quiz.judul,
            type: quiz.type
          },
          result: null
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        quiz: {
          id: quiz.id,
          judul: quiz.judul,
          type: quiz.type
        },
        result: {
          scores: studentResult.scores,
          submittedAt: studentResult.submittedAt
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