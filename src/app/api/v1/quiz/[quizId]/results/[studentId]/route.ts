// src/app/api/v1/quiz/[quizId]/results/[studentId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth";
import { ApiError } from "@/lib/errors";
import prisma from "@/lib/prisma";

// Update type definition to match Next.js requirement
interface RouteParams {
  params: {
    quizId: string;
    studentId: string;
  }
}

interface SoalPgRef {
  pertanyaan: string;
  quizId: string;
  opsiJawaban: string[];
  kunciJawaban: number;
}

interface SoalEssayRef {
  pertanyaan: string;
  quizId: string;
}

interface JawabanPg {
  id: string;
  jawaban: number;
  isCorrect: boolean;
  nilai: number;
  soalRef: SoalPgRef;
}

interface JawabanEssay {
  id: string;
  jawaban: string;
  nilai: number | null;
  feedback: string | null;
  soalRef: SoalEssayRef;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isPgAnswer(answer: JawabanPg | JawabanEssay): answer is JawabanPg {
  return 'opsiJawaban' in answer.soalRef;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams  // Update parameter type
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin-token")?.value;

    if (!token) {
      throw new ApiError("UNAUTHORIZED", "Unauthorized", 401);
    }

    await verifyJWT(token);

    const { quizId, studentId } = params;  // Access params directly

    // Rest of the code remains exactly the same
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      select: { type: true }
    });

    if (!quiz) {
      throw new ApiError("NOT_FOUND", "Quiz tidak ditemukan", 404);
    }

    const answers = quiz.type === "MULTIPLE_CHOICE" 
      ? await prisma.jawabanPg.findMany({
          where: {
            studentId,
            soalRef: { quizId },
            latestAttempt: true
          },
          orderBy: {
            soalRef: { id: 'asc' }
          },
          include: {
            soalRef: {
              select: {
                pertanyaan: true,
                quizId: true,
                opsiJawaban: true,
                kunciJawaban: true
              }
            }
          }
        })
      : await prisma.jawabanEssay.findMany({
          where: {
            studentId,
            soalRef: { quizId },
            latestAttempt: true
          },
          orderBy: {
            soalRef: { id: 'asc' }
          },
          include: {
            soalRef: {
              select: {
                pertanyaan: true,
                quizId: true
              }
            }
          }
        });

    const transformedAnswers = quiz.type === "MULTIPLE_CHOICE"
      ? (answers as JawabanPg[]).map(answer => ({
          ...answer,
          jawabanText: answer.soalRef.opsiJawaban[answer.jawaban],
          kunciJawabanText: answer.soalRef.opsiJawaban[answer.soalRef.kunciJawaban]
        }))
      : answers;

    return NextResponse.json({
      success: true,
      data: {
        quiz: {
          id: quizId,
          type: quiz.type
        },
        answers: transformedAnswers
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