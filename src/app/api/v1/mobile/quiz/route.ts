// src/app/api/v1/mobile/quiz/route.ts

import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
import { ApiError } from "@/lib/errors";
import { getQuizzes } from "@/services/quizService";
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
    if (!materiId) {
      throw new ApiError("BAD_REQUEST", "Materi ID diperlukan", 400);
    }

    // Get active quizzes for the materi
    const { quizzes } = await getQuizzes({ 
      materiId,
      status: true,
      sortBy: "judul",
      sortOrder: "asc",
      search: "",
      page: 1,
      limit: 100
    });

    return NextResponse.json({
      success: true,
      data: quizzes
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