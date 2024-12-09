// src/services/mobileQuizResultService.ts

import { cache } from "react";
import prisma from "@/lib/prisma";
import { ApiError } from "@/lib/errors";
import type { QuizType } from "@prisma/client";

interface QuizResultFilters {
  materiId?: string;
  type?: QuizType;
}

export const getMobileQuizResults = cache(async (
  studentId: string,
  filters: QuizResultFilters = {}
) => {
  try {
    const { materiId, type } = filters;

    // Build where clause
    const whereQuiz = {
      ...(materiId && { materiId }),
      ...(type && { type }),
      status: true
    };

    // Get all quizzes first
    const quizzes = await prisma.quiz.findMany({
      where: whereQuiz,
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
        }
      },
      orderBy: { judul: 'asc' }
    });

    // Get student's answers for these quizzes
    const results = await Promise.all(quizzes.map(async quiz => {
      if (quiz.type === 'MULTIPLE_CHOICE') {
        const answers = await prisma.jawabanPg.findMany({
          where: {
            studentId,
            soalId: {
              in: quiz.soalPg.map(s => s.id)
            },
            latestAttempt: true
          },
          select: {
            nilai: true,
            isCorrect: true
          }
        });

        const totalAnswered = answers.length;
        const avgScore = totalAnswered > 0 
          ? (answers.reduce((sum, ans) => sum + ans.nilai, 0) / totalAnswered) * 100
          : 0;

        return {
          quizId: quiz.id,
          quizTitle: quiz.judul,
          type: quiz.type,
          score: Math.round(avgScore * 10) / 10,
          progress: {
            completed: totalAnswered,
            total: quiz.soalPg.length,
            isComplete: totalAnswered === quiz.soalPg.length
          }
        };

      } else {
        const answers = await prisma.jawabanEssay.findMany({
          where: {
            studentId,
            soalId: {
              in: quiz.soalEssay.map(s => s.id)
            },
            latestAttempt: true,
            NOT: { nilai: null } // Only count graded answers
          },
          select: {
            nilai: true
          }
        });

        const totalAnswered = answers.length;
        const avgScore = totalAnswered > 0 
          ? answers.reduce((sum, ans) => sum + (ans.nilai || 0), 0) / totalAnswered
          : 0;

        return {
          quizId: quiz.id,
          quizTitle: quiz.judul,
          type: quiz.type,
          score: Math.round(avgScore * 10) / 10,
          progress: {
            completed: totalAnswered,
            total: quiz.soalEssay.length,
            isComplete: totalAnswered === quiz.soalEssay.length
          }
        };
      }
    }));

    return results.filter(result => result.progress.total > 0); // Only return quizzes that have questions

  } catch (e) {
    console.error("Get Mobile Quiz Results Error:", e);
    throw new ApiError("FETCH_FAILED", "Gagal mengambil hasil quiz", 500);
  }
});