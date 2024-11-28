/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/api/v1/quiz/[quizId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { verifyJWT } from "@/lib/auth";
import { getQuizById, updateQuiz, deleteQuiz } from "@/services/quizService";
import { ApiError } from "@/lib/errors";
import { quizSchema } from "@/types/quiz";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin-token")?.value;

    if (!token) {
      throw new ApiError("UNAUTHORIZED", "Unauthorized", 401);
    }

    await verifyJWT(token);

    const { quizId } = await params;
    const quiz = await getQuizById(quizId);
    
    if (!quiz) {
      throw new ApiError("NOT_FOUND", "Quiz tidak ditemukan", 404);
    }

    return NextResponse.json({
      success: true,
      data: quiz
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
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

    const { quizId } = await params;
    
    // Check if quiz exists before updating
    const existingQuiz = await getQuizById(quizId);
    if (!existingQuiz) {
      throw new ApiError("NOT_FOUND", "Quiz tidak ditemukan", 404);
    }

    const body = await request.json();
    
    // Remove type and materiId from update data since they can't be changed
    const { type, materiId, ...updateData } = body;
    
    const validatedData = quizSchema.partial().parse(updateData);
    
    const quiz = await updateQuiz(quizId, validatedData);

    return NextResponse.json({
      success: true,
      data: quiz,
      message: "Quiz berhasil diupdate"
    });
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
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

    const { quizId } = await params;

    // Check if quiz exists before deleting
    const existingQuiz = await getQuizById(quizId);
    if (!existingQuiz) {
      throw new ApiError("NOT_FOUND", "Quiz tidak ditemukan", 404);
    }

    await deleteQuiz(quizId);

    return NextResponse.json({
      success: true,
      message: "Quiz berhasil dihapus"
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