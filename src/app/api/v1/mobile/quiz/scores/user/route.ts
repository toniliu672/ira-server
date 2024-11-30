// src/app/api/v1/mobile/quiz/scores/user/route.ts

import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
import { ApiError } from "@/lib/errors";
import { AUTH_CONFIG } from "@/config/auth";
import prisma from "@/lib/prisma";
import { cache } from "react";

interface Answer {
  nilai: number | null;
  isCorrect?: boolean;
  feedback?: string | null;
}

interface QuizScore {
  quizId: string;
  title: string;
  type: 'MULTIPLE_CHOICE' | 'ESSAY';
  materiId: string;
  answers: Answer[];
  avgScore: number;
}

// Cache user scores for 1 minute
const getUserScores = cache(async (userId: string, materiId?: string) => {
  const whereClause = {
    id: userId,
    activeStatus: true,
    ...(materiId && {
      OR: [
        {
          jawabanPg: {
            some: {
              soalRef: {
                quizRef: {
                  materiId
                }
              }
            }
          }
        },
        {
          jawabanEssay: {
            some: {
              soalRef: {
                quizRef: {
                  materiId
                }
              }
            }
          }
        }
      ]
    })
  };

  return prisma.student.findUnique({
    where: whereClause,
    select: {
      jawabanPg: {
        where: materiId ? {
          soalRef: {
            quizRef: {
              materiId
            }
          }
        } : undefined,
        select: {
          soalRef: {
            select: {
              quizRef: {
                select: {
                  id: true,
                  judul: true,
                  type: true,
                  materiId: true
                }
              }
            }
          },
          nilai: true,
          isCorrect: true
        }
      },
      jawabanEssay: {
        where: materiId ? {
          soalRef: {
            quizRef: {
              materiId
            }
          }
        } : undefined,
        select: {
          soalRef: {
            select: {
              quizRef: {
                select: {
                  id: true,
                  judul: true,
                  type: true,
                  materiId: true
                }
              }
            }
          },
          nilai: true,
          feedback: true
        }
      }
    }
  });
});

export async function GET(request: NextRequest) {
  try {
    // Auth validation
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      throw new ApiError("UNAUTHORIZED", "Token tidak valid", 401);
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyJWT(token);

    // Device ID validation
    const deviceId = request.headers.get(AUTH_CONFIG.mobile.deviceIdHeader);
    if (AUTH_CONFIG.mobile.requiredForMobile && !deviceId) {
      throw new ApiError("UNAUTHORIZED", "Device ID diperlukan", 401);
    }

    // Get materiId filter from query if exists
    const materiId = request.nextUrl.searchParams.get("materiId") || undefined;

    // Get user's scores
    const userScores = await getUserScores(payload.sub, materiId);
    if (!userScores) {
      throw new ApiError("NOT_FOUND", "User tidak ditemukan", 404);
    }

    // Process and group scores by quiz
    const quizScores = new Map<string, QuizScore>();

    // Process PG answers
    userScores.jawabanPg.forEach(jawaban => {
      const quiz = jawaban.soalRef.quizRef;
      if (!quizScores.has(quiz.id)) {
        quizScores.set(quiz.id, {
          quizId: quiz.id,
          title: quiz.judul,
          type: quiz.type,
          materiId: quiz.materiId,
          answers: [],
          avgScore: 0
        });
      }
      quizScores.get(quiz.id)?.answers.push({
        nilai: jawaban.nilai,
        isCorrect: jawaban.isCorrect
      });
    });

    // Process Essay answers
    userScores.jawabanEssay.forEach(jawaban => {
      const quiz = jawaban.soalRef.quizRef;
      if (!quizScores.has(quiz.id)) {
        quizScores.set(quiz.id, {
          quizId: quiz.id,
          title: quiz.judul,
          type: quiz.type,
          materiId: quiz.materiId,
          answers: [],
          avgScore: 0
        });
      }
      quizScores.get(quiz.id)?.answers.push({
        nilai: jawaban.nilai,
        feedback: jawaban.feedback
      });
    });

    // Calculate average scores
    const scores = Array.from(quizScores.values()).map(quiz => {
      const totalScore = quiz.answers.reduce((sum: number, ans: Answer) => sum + (ans.nilai || 0), 0);
      const avgScore = quiz.answers.length > 0 ? totalScore / quiz.answers.length : 0;
      return {
        quizId: quiz.quizId,
        title: quiz.title,
        type: quiz.type,
        materiId: quiz.materiId,
        score: Math.round(avgScore * 100) / 100,
        totalAnswered: quiz.answers.length
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        scores
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