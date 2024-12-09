/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/v1/mobile/quiz/scores/user/route.ts

import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
import { ApiError } from "@/lib/errors";
import { AUTH_CONFIG } from "@/config/auth";
import prisma from "@/lib/prisma";
import { cache } from "react";

interface QuizResultData {
  quizId: string;
  quizTitle: string;
  type: 'MULTIPLE_CHOICE' | 'ESSAY';
  score: number;
  progress: {
    completed: number;
    total: number;
    isComplete: boolean;
    lastSubmitted: string | null;
  };
}

// Cache user scores for 1 minute
const getUserScores = cache(async (userId: string, materiId?: string, type?: string) => {
  const quizzes = await prisma.quiz.findMany({
    where: {
      materiId: materiId || undefined,
      type: type as any || undefined,
      status: true,
    },
    select: {
      id: true,
      judul: true,
      type: true,
      soalPg: {
        where: { status: true },
        select: { id: true }
      },
      soalEssay: {
        where: { status: true },
        select: { id: true }
      },
      _count: {
        select: {
          soalPg: {
            where: { status: true }
          },
          soalEssay: {
            where: { status: true }
          }
        }
      }
    }
  });

  const results = await Promise.all(quizzes.map(async (quiz) => {
    const isMultipleChoice = quiz.type === 'MULTIPLE_CHOICE';
    
    const answers = isMultipleChoice ?
      await prisma.jawabanPg.findMany({
        where: {
          studentId: userId,
          soalId: { in: quiz.soalPg.map(s => s.id) },
          latestAttempt: true
        },
        orderBy: { attemptCount: 'desc' },
        select: {
          nilai: true,
          attemptCount: true
        }
      }) :
      await prisma.jawabanEssay.findMany({
        where: {
          studentId: userId,
          soalId: { in: quiz.soalEssay.map(s => s.id) },
          latestAttempt: true,
          NOT: { nilai: null }
        },
        orderBy: { attemptCount: 'desc' },
        select: {
          nilai: true,
          attemptCount: true
        }
      });

    const totalQuestions = isMultipleChoice ? 
      quiz._count.soalPg : 
      quiz._count.soalEssay;

    const totalAnswered = answers.length;
    const avgScore = answers.length > 0 
      ? answers.reduce((sum, ans) => sum + (ans.nilai || 0), 0) / answers.length
      : 0;

    // Get latest attempt count for lastSubmitted
    const latestAttempt = answers.length > 0 ? 
      Math.max(...answers.map(a => a.attemptCount)) : 
      null;

    return {
      quizId: quiz.id,
      quizTitle: quiz.judul,
      type: quiz.type,
      score: Math.round(avgScore * 100) / 100,
      progress: {
        completed: totalAnswered,
        total: totalQuestions,
        isComplete: totalAnswered === totalQuestions,
        lastSubmitted: latestAttempt ? new Date().toISOString() : null // Using current date since we don't store actual submission date
      }
    } as QuizResultData;
  }));

  return results;
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

    // Get optional filters from query params
    const searchParams = request.nextUrl.searchParams;
    const materiId = searchParams.get("materiId");
    const type = searchParams.get("type") || undefined;
    
    if (!materiId) {
      throw new ApiError("BAD_REQUEST", "Materi ID diperlukan", 400);
    }

    // Get quiz results with cache
    const scores = await getUserScores(payload.sub, materiId, type);

    return NextResponse.json({
      success: true,
      data: { scores }
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