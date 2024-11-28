// src/app/api/v1/mobile/quiz/[quizId]/answers/route.ts

import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
import { ApiError } from "@/lib/errors";
import { getQuizById } from "@/services/quizService";
import { createJawabanPg } from "@/services/jawabanPgService";
import { createJawabanEssay } from "@/services/jawabanEssayService";
import { AUTH_CONFIG } from "@/config/auth";
import { jawabanPgSchema, jawabanEssaySchema } from "@/types/quiz";

export async function POST(
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

    // Get quiz type first
    const quiz = await getQuizById(params.quizId);
    
    const body = await request.json();

    if (quiz.type === 'MULTIPLE_CHOICE') {
      // Validate array of answers
      if (!Array.isArray(body.answers)) {
        throw new ApiError("BAD_REQUEST", "Format jawaban tidak valid", 400);
      }

      // Process each answer
      const results = await Promise.all(
        body.answers.map(async (answer) => {
          const validatedAnswer = jawabanPgSchema.parse({
            ...answer,
            studentId: payload.sub
          });
          return createJawabanPg(validatedAnswer);
        })
      );

      // Calculate total score
      const totalScore = results.reduce((acc, curr) => acc + curr.nilai, 0) / results.length;

      return NextResponse.json({
        success: true,
        data: {
          results,
          totalScore
        },
        message: "Jawaban berhasil disimpan"
      }, { status: 201 });

    } else {
      // For essay type
      const validatedAnswer = jawabanEssaySchema.parse({
        ...body,
        studentId: payload.sub,
        soalId: body.soalId
      });

      const result = await createJawabanEssay(validatedAnswer);

      return NextResponse.json({
        success: true,
        data: result,
        message: "Jawaban essay berhasil disimpan"
      }, { status: 201 });
    }
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