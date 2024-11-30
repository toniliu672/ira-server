// src/app/api/v1/mobile/quiz/[quizId]/answers/route.ts

import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
import { ApiError } from "@/lib/errors";
import { createJawabanPg } from "@/services/jawabanPgService";
import { createJawabanEssay } from "@/services/jawabanEssayService";
import { z } from "zod";
import prisma from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ quizId: string }>;
};

const pgAnswerInput = z.object({
  answers: z
    .array(
      z.object({
        soalId: z.string(),
        jawaban: z.number().min(0).max(3),
      })
    )
    .min(1, "Minimal satu jawaban diperlukan"),
});

const essayAnswerInput = z.object({
  soalId: z.string(),
  jawaban: z.string().min(1, "Jawaban tidak boleh kosong"),
});

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { quizId } = await context.params;

    // Auth validation
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw new ApiError("UNAUTHORIZED", "Token tidak valid", 401);
    }

    const token = authHeader.split(" ")[1];
    const payload = await verifyJWT(token);

    // Parse body first to fail fast
    const body = await request.json();

    // Get quiz details and verify student in single transaction
    const [quiz, student] = await prisma.$transaction([
      prisma.quiz.findUnique({
        where: {
          id: quizId,
          status: true,
        },
        include: {
          soalPg: {
            where: { status: true },
            select: { id: true },
          },
          soalEssay: {
            where: { status: true },
            select: { id: true },
          },
        },
      }),
      prisma.student.findUnique({
        where: {
          id: payload.sub,
          activeStatus: true,
        },
      }),
    ]);

    if (!quiz) {
      throw new ApiError(
        "NOT_FOUND",
        "Quiz tidak ditemukan atau tidak aktif",
        404
      );
    }

    if (!student) {
      throw new ApiError(
        "NOT_FOUND",
        "Student tidak ditemukan atau tidak aktif",
        404
      );
    }

    if (quiz.type === "MULTIPLE_CHOICE") {
      const { answers } = pgAnswerInput.parse(body);

      // Validate all soalIds exist in quiz
      const validSoalIds = new Set(quiz.soalPg.map((s) => s.id));
      const invalidSoalIds = answers.filter((a) => !validSoalIds.has(a.soalId));

      if (invalidSoalIds.length > 0) {
        throw new ApiError(
          "VALIDATION_ERROR",
          "Beberapa soal tidak valid",
          400
        );
      }

      // Process in chunks to avoid timeouts
      const CHUNK_SIZE = 10;
      let successCount = 0;
      let totalScore = 0;

      for (let i = 0; i < answers.length; i += CHUNK_SIZE) {
        const chunk = answers.slice(i, i + CHUNK_SIZE);
        const results = await Promise.all(
          chunk.map((answer) =>
            createJawabanPg({
              studentId: payload.sub,
              soalId: answer.soalId,
              jawaban: answer.jawaban,
            }).catch((e) => {
              console.error(
                `Failed to save answer for soalId ${answer.soalId}:`,
                e
              );
              return null;
            })
          )
        );

        const validResults = results.filter(Boolean);
        successCount += validResults.length;
        totalScore += validResults.reduce((sum, r) => sum + (r?.nilai || 0), 0);
      }

      if (successCount === 0) {
        throw new ApiError(
          "PROCESSING_FAILED",
          "Gagal menyimpan semua jawaban",
          500
        );
      }

      const avgScore = (totalScore / successCount) * 100;

      return NextResponse.json(
        {
          success: true,
          data: {
            submitted: successCount,
            failed: answers.length - successCount,
            avgScore: Math.round(avgScore * 100) / 100,
          },
          message:
            successCount === answers.length
              ? "Semua jawaban berhasil disimpan"
              : `${successCount} dari ${answers.length} jawaban berhasil disimpan`,
        },
        { status: 201 }
      );
    } else {
      const { soalId, jawaban } = essayAnswerInput.parse(body);

      // Validate soalId exists in quiz
      const validSoal = quiz.soalEssay.find((s) => s.id === soalId);
      if (!validSoal) {
        throw new ApiError("VALIDATION_ERROR", "Soal tidak valid", 400);
      }

      const result = await createJawabanEssay({
        studentId: payload.sub,
        soalId,
        jawaban,
      });

      return NextResponse.json(
        {
          success: true,
          data: {
            id: result.id,
            status: "PENDING_REVIEW",
          },
          message: "Jawaban essay berhasil disimpan",
        },
        { status: 201 }
      );
    }
  } catch (e) {
    console.error("Mobile Quiz Answer Error:", e);

    if (e instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Format data tidak valid",
          details: e.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    if (e instanceof ApiError) {
      return NextResponse.json(
        {
          success: false,
          error: e.message,
        },
        { status: e.status }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan server",
      },
      { status: 500 }
    );
  }
}