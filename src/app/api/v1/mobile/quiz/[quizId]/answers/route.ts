// src/app/api/v1/mobile/quiz/[quizId]/answers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
import { ApiError } from "@/lib/errors";
import { getQuizById } from "@/services/quizService";
import { createJawabanPg } from "@/services/jawabanPgService";
import { createJawabanEssay } from "@/services/jawabanEssayService";
import { AUTH_CONFIG } from "@/config/auth";
import { jawabanPgSchema, jawabanEssaySchema } from "@/types/quiz";

type RouteContext = {
  params: Promise<{ quizId: string }>;
};

interface PgAnswerInput {
  soalId: string;
  jawaban: number;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { quizId } = await context.params;

    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw new ApiError("UNAUTHORIZED", "Token tidak valid", 401);
    }

    const token = authHeader.split(" ")[1];
    const payload = await verifyJWT(token);

    const deviceId = request.headers.get(AUTH_CONFIG.mobile.deviceIdHeader);
    if (AUTH_CONFIG.mobile.requiredForMobile && !deviceId) {
      throw new ApiError("UNAUTHORIZED", "Device ID diperlukan", 401);
    }

    const quiz = await getQuizById(quizId);
    if (!quiz) {
      throw new ApiError("NOT_FOUND", "Quiz tidak ditemukan", 404);
    }

    const body = await request.json();

    if (quiz.type === "MULTIPLE_CHOICE") {
      if (!Array.isArray(body.answers)) {
        throw new ApiError("BAD_REQUEST", "Format jawaban tidak valid", 400);
      }

      const results = await Promise.all(
        body.answers.map(async (answer: PgAnswerInput) => {
          const validatedAnswer = jawabanPgSchema.parse({
            ...answer,
            studentId: payload.sub,
          });
          return createJawabanPg(validatedAnswer);
        })
      );

      const totalScore =
        results.reduce((acc, curr) => acc + curr.nilai, 0) / results.length;

      return NextResponse.json(
        {
          success: true,
          data: {
            results,
            totalScore,
          },
          message: "Jawaban berhasil disimpan",
        },
        { status: 201 }
      );
    } else {
      const validatedAnswer = jawabanEssaySchema.parse({
        ...body,
        studentId: payload.sub,
        soalId: body.soalId,
      });

      const result = await createJawabanEssay(validatedAnswer);

      return NextResponse.json(
        {
          success: true,
          data: result,
          message: "Jawaban essay berhasil disimpan",
        },
        { status: 201 }
      );
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
