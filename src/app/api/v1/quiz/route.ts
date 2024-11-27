// src/app/api/v1/quiz/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { verifyJWT } from "@/lib/auth";
import { getQuizzes, getQuizStats, createQuiz } from "@/services/quizService";
import { ApiError } from "@/lib/errors";
import { quizSchema } from "@/types/quiz";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin-token")?.value;

    if (!token) {
      throw new ApiError("UNAUTHORIZED", "Unauthorized", 401);
    }

    await verifyJWT(token);

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") as "MULTIPLE_CHOICE" | "ESSAY" | undefined;
    const materiId = searchParams.get("materiId") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = (searchParams.get("sortBy") || "judul") as "judul" | "type" | "status";
    const sortOrder = (searchParams.get("sortOrder") || "asc") as "asc" | "desc";
    const status = searchParams.get("status") !== "false";

    const [quizList, stats] = await Promise.all([
      getQuizzes({ search, type, materiId, page, limit, sortBy, sortOrder, status }),
      getQuizStats()
    ]);

    return NextResponse.json({
      success: true,
      data: {
        ...quizList,
        stats
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

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin-token")?.value;

    if (!token) {
      throw new ApiError("UNAUTHORIZED", "Unauthorized", 401);
    }

    await verifyJWT(token);

    // Validate CSRF
    const csrfToken = request.headers.get("X-CSRF-Token");
    const storedCsrfToken = cookieStore.get("csrf-token")?.value;

    if (!csrfToken || !storedCsrfToken || csrfToken !== storedCsrfToken) {
      throw new ApiError("FORBIDDEN", "Invalid CSRF token", 403);
    }

    const body = await request.json();
    const validatedData = quizSchema.parse(body);
    
    const quiz = await createQuiz(validatedData);

    return NextResponse.json({
      success: true,
      data: quiz,
      message: "Quiz berhasil dibuat"
    }, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation error", details: e.errors },
        { status: 400 }
      );
    }
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