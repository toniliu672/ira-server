// src/app/api/v1/mobile/quiz/[quizId]/answers/route.ts

import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
import { ApiError } from "@/lib/errors";
import { createJawabanPg, updateStudentPgScore } from "@/services/jawabanPgService";
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

    // Get quiz details and verify student
    const quiz = await prisma.quiz.findUnique({
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
    });

    const student = await prisma.student.findUnique({
      where: {
        id: payload.sub,
        activeStatus: true,
      },
    });

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

      // Process all answers in a transaction
      const results = await prisma.$transaction(async (tx) => {
        // Set previous answers as not latest
        await tx.jawabanPg.updateMany({
          where: {
            studentId: payload.sub,
            soalId: {
              in: answers.map(a => a.soalId)
            },
            latestAttempt: true
          },
          data: {
            latestAttempt: false
          }
        });

        // Create new answers
        const newAnswers = await Promise.all(
          answers.map(answer => 
            createJawabanPg({
              studentId: payload.sub,
              soalId: answer.soalId,
              jawaban: answer.jawaban
            }, tx)
          )
        );

        // Update final score
        await updateStudentPgScore(payload.sub, tx);

        return newAnswers;
      });

      // Calculate final statistics
      const totalScore = results.reduce((sum, r) => sum + (r.nilai || 0), 0);
      const avgScore = (totalScore / results.length) * 100;

      return NextResponse.json(
        {
          success: true,
          data: {
            submitted: results.length,
            failed: 0,
            avgScore: Math.round(avgScore * 100) / 100,
          },
          message: "Semua jawaban berhasil disimpan"
        },
        { status: 201 }
      );
    } else {
      // Handle essay submission
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