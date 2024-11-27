// src/app/api/v1/quiz/[quizId]/soal-essay/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { verifyJWT } from "@/lib/auth";
import { 
  createSoalEssay,
  getSoalEssayByQuizId 
} from "@/services/soalEssayService";
import { ApiError } from "@/lib/errors";
import { soalEssaySchema } from "@/types/quiz";

export async function GET(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin-token")?.value;

    if (!token) {
      throw new ApiError("UNAUTHORIZED", "Unauthorized", 401);
    }

    await verifyJWT(token);

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") !== "false";

    const soalEssay = await getSoalEssayByQuizId(params.quizId, status);

    return NextResponse.json({
      success: true,
      data: soalEssay
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

export async function POST(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
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
    const validatedData = soalEssaySchema.parse({
      ...body,
      quizId: params.quizId
    });
    
    const soalEssay = await createSoalEssay(validatedData);

    return NextResponse.json({
      success: true,
      data: soalEssay,
      message: "Soal essay berhasil dibuat"
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