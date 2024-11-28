// src/app/api/v1/mobile/quiz/results/route.ts

import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
import { ApiError } from "@/lib/errors";
import { getStudentQuizResults } from "@/services/quizResultService";
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
    const materiId = searchParams.get("materiId");
    const quizType = searchParams.get("type") as "MULTIPLE_CHOICE" | "ESSAY" | undefined;

    // Get student's quiz results
    const results = await getStudentQuizResults(payload.sub, {
      materiId: materiId || undefined,
      type: quizType
    });

    return NextResponse.json({
      success: true,
      data: results
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