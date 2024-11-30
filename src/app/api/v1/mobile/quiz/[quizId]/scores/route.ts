// src/app/api/v1/mobile/quiz/[quizId]/scores/route.ts

import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
import { ApiError } from "@/lib/errors";
import { AUTH_CONFIG } from "@/config/auth";
import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import type { QuizType } from "@prisma/client";

type RouteContext = {
  params: Promise<{ quizId: string }>;
};

interface RankingStudent {
  id: string;
  username: string;
  fullName: string;
  lastLogin: Date | null;
  score: number;
}

// Cache rankings for 5 minutes
const getQuizRankings = unstable_cache(
  async (quizId: string): Promise<{ type: QuizType; rankings: RankingStudent[] } | null> => {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId, status: true },
      select: { type: true }
    });

    if (!quiz) return null;

    if (quiz.type === 'MULTIPLE_CHOICE') {
      const rankings = await prisma.student.findMany({
        where: {
          jawabanPg: {
            some: {
              soalRef: { quizId }
            }
          }
        },
        select: {
          id: true,
          username: true,
          fullName: true,
          nilaiPg: true,
          lastLogin: true
        },
        orderBy: {
          nilaiPg: 'desc'
        },
        take: 100
      });

      return {
        type: quiz.type,
        rankings: rankings.map(r => ({
          ...r,
          score: r.nilaiPg || 0
        }))
      };
    } else {
      const rankings = await prisma.student.findMany({
        where: {
          jawabanEssay: {
            some: {
              soalRef: { quizId }
            }
          }
        },
        select: {
          id: true,
          username: true,
          fullName: true,
          nilaiEssay: true,
          lastLogin: true
        },
        orderBy: {
          nilaiEssay: 'desc'
        },
        take: 100
      });

      return {
        type: quiz.type,
        rankings: rankings.map(r => ({
          ...r,
          score: r.nilaiEssay || 0
        }))
      };
    }
  },
  ['quiz-rankings'],
  { revalidate: 300, tags: ['quiz-scores'] }
);

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { quizId } = await context.params;

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

    // Get rankings
    const result = await getQuizRankings(quizId);
    if (!result) {
      throw new ApiError("NOT_FOUND", "Quiz tidak ditemukan", 404);
    }

    const { rankings } = result;

    // Find user's rank
    const userRank = rankings.findIndex(r => r.id === payload.sub) + 1;
    const userScore = rankings.find(r => r.id === payload.sub);

    // Format response
    return NextResponse.json({
      success: true,
      data: {
        rankings: rankings.map((r, idx) => ({
          rank: idx + 1,
          username: r.username,
          name: r.fullName,
          score: Math.round(r.score * 100) / 100,
          lastSubmitted: r.lastLogin,
          isYou: r.id === payload.sub
        })),
        user: userScore ? {
          rank: userRank,
          score: Math.round(userScore.score * 100) / 100
        } : null
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