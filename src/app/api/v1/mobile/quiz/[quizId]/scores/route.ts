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

// Optimized cache strategy with shorter duration for new users
const getQuizRankings = unstable_cache(
  async (
    quizId: string,
    userId: string
  ): Promise<{ type: QuizType; rankings: RankingStudent[] } | null> => {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId, status: true },
      select: { type: true },
    });

    if (!quiz) return null;

    // First get current user's data to ensure they're included
    const currentUser = await prisma.student.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        fullName: true,
        lastLogin: true,
        nilaiPg: true,
        nilaiEssay: true,
      },
    });

    if (!currentUser) return null;

    if (quiz.type === "MULTIPLE_CHOICE") {
      const rankings = await prisma.student.findMany({
        where: {
          OR: [
            {
              jawabanPg: {
                some: {
                  soalRef: { quizId },
                },
              },
            },
            { id: userId }, // Always include current user
          ],
        },
        select: {
          id: true,
          username: true,
          fullName: true,
          nilaiPg: true,
          lastLogin: true,
          jawabanPg: {
            where: {
              soalRef: { quizId },
              latestAttempt: true,
            },
            select: {
              nilai: true,
            },
          },
        },
        orderBy: [{ nilaiPg: "desc" }, { username: "asc" }],
        take: 100,
      });

      return {
        type: quiz.type,
        rankings: rankings.map((r) => ({
          ...r,
          score:
            r.jawabanPg.length > 0
              ? r.jawabanPg.reduce((sum, ans) => sum + (ans.nilai || 0), 0) /
                r.jawabanPg.length
              : 0,
        })),
      };
    } else {
      const rankings = await prisma.student.findMany({
        where: {
          OR: [
            {
              jawabanEssay: {
                some: {
                  soalRef: { quizId },
                },
              },
            },
            { id: userId }, // Always include current user
          ],
        },
        select: {
          id: true,
          username: true,
          fullName: true,
          nilaiEssay: true,
          lastLogin: true,
          jawabanEssay: {
            where: {
              soalRef: { quizId },
              latestAttempt: true,
            },
            select: {
              nilai: true,
            },
          },
        },
        orderBy: [{ nilaiEssay: "desc" }, { username: "asc" }],
        take: 100,
      });

      return {
        type: quiz.type,
        rankings: rankings.map((r) => ({
          ...r,
          score:
            r.jawabanEssay.length > 0
              ? r.jawabanEssay.reduce((sum, ans) => sum + (ans.nilai || 0), 0) /
                r.jawabanEssay.length
              : 0,
        })),
      };
    }
  },
  ["quiz-rankings"],
  {
    revalidate: 60, // Cache for 1 minute only
    tags: ["quiz-scores"],
  }
);

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { quizId } = await context.params;

    // Auth validation
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw new ApiError("UNAUTHORIZED", "Token tidak valid", 401);
    }

    const token = authHeader.split(" ")[1];
    const payload = await verifyJWT(token);

    // Device ID validation
    const deviceId = request.headers.get(AUTH_CONFIG.mobile.deviceIdHeader);
    if (AUTH_CONFIG.mobile.requiredForMobile && !deviceId) {
      throw new ApiError("UNAUTHORIZED", "Device ID diperlukan", 401);
    }

    // Get rankings with current user context
    const result = await getQuizRankings(quizId, payload.sub);
    if (!result) {
      throw new ApiError("NOT_FOUND", "Quiz tidak ditemukan", 404);
    }

    const { rankings } = result;

    // Find user's rank, defaulting to last position if not found
    const userRank = rankings.findIndex((r) => r.id === payload.sub) + 1;
    const userScore = rankings.find((r) => r.id === payload.sub);

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
          isYou: r.id === payload.sub,
        })),
        user: {
          rank: userRank || rankings.length + 1,
          score: Math.round((userScore?.score || 0) * 100) / 100,
        },
      },
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
