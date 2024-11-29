/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/v1/mobile/quiz/[quizId]/answers/route.ts

import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
import { ApiError } from "@/lib/errors";
import { getQuizById } from "@/services/quizService";
import { createJawabanPg } from "@/services/jawabanPgService";
import { createJawabanEssay } from "@/services/jawabanEssayService";
import { AUTH_CONFIG } from "@/config/auth";
import { z } from "zod";

// Validation schemas
const baseAnswerSchema = z.object({
  quizId: z.string().uuid(),
  studentId: z.string().uuid()
});

const pgAnswerSchema = baseAnswerSchema.extend({
  answers: z.array(z.object({
    soalId: z.string().uuid(),
    jawaban: z.number().min(0).max(3)
  }))
});

const essayAnswerSchema = baseAnswerSchema.extend({
  soalId: z.string().uuid(),
  jawaban: z.string().min(1, "Jawaban tidak boleh kosong")
});

export async function POST(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    // Basic validation
    if (!params.quizId) {
      throw new ApiError("BAD_REQUEST", "Quiz ID diperlukan", 400);
    }

    // Auth validation
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw new ApiError("UNAUTHORIZED", "Token tidak valid", 401);
    }

    // Extract and verify JWT
    const token = authHeader.split(" ")[1];
    const payload = await verifyJWT(token);

    // Device ID validation for mobile
    const deviceId = request.headers.get(AUTH_CONFIG.mobile.deviceIdHeader);
    if (AUTH_CONFIG.mobile.requiredForMobile && !deviceId) {
      throw new ApiError("UNAUTHORIZED", "Device ID diperlukan", 401);
    }

    // Get quiz details first
    const quiz = await getQuizById(params.quizId);
    if (!quiz) {
      throw new ApiError("NOT_FOUND", "Quiz tidak ditemukan", 404);
    }

    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
    } catch {
      throw new ApiError("BAD_REQUEST", "Invalid JSON body", 400);
    }

    // Handle different quiz types
    if (quiz.type === "MULTIPLE_CHOICE") {
      const validatedData = pgAnswerSchema.parse({
        ...body,
        quizId: params.quizId,
        studentId: payload.sub
      });

      // Process each answer
      const results = await Promise.allSettled(
        validatedData.answers.map(answer =>
          createJawabanPg({
            studentId: payload.sub,
            soalId: answer.soalId,
            jawaban: answer.jawaban
          })
        )
      );

      // Calculate success rate
      const successful = results.filter(r => r.status === "fulfilled");
      const failed = results.filter(r => r.status === "rejected");

      if (successful.length === 0) {
        throw new ApiError(
          "PROCESSING_FAILED",
          "Gagal menyimpan semua jawaban",
          500
        );
      }

      // Calculate average score from successful submissions
      const scores = successful
        .map(r => (r as PromiseFulfilledResult<any>).value.nilai);
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

      return NextResponse.json({
        success: true,
        data: {
          submitted: successful.length,
          failed: failed.length,
          avgScore: avgScore * 100 // Convert to percentage
        },
        message: successful.length === results.length
          ? "Semua jawaban berhasil disimpan"
          : `${successful.length} dari ${results.length} jawaban berhasil disimpan`
      }, { status: 201 });

    } else {
      // Essay type
      const validatedData = essayAnswerSchema.parse({
        ...body,
        quizId: params.quizId,
        studentId: payload.sub
      });

      const result = await createJawabanEssay({
        studentId: payload.sub,
        soalId: validatedData.soalId,
        jawaban: validatedData.jawaban
      });

      return NextResponse.json({
        success: true,
        data: {
          id: result.id,
          status: "PENDING_REVIEW"
        },
        message: "Jawaban essay berhasil disimpan"
      }, { status: 201 });
    }

  } catch (e) {
    console.error("Mobile Quiz Answer Error:", e);

    if (e instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: "Validation error",
        details: e.errors.map(err => ({
          field: err.path.join("."),
          message: err.message
        }))
      }, { status: 400 });
    }

    if (e instanceof ApiError) {
      return NextResponse.json({
        success: false,
        error: e.message
      }, { status: e.status });
    }

    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
}