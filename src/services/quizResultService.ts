// src/services/quizResultService.ts

import prisma from "@/lib/prisma";
import { ApiError } from "@/lib/errors";
import { unstable_cache } from "next/cache";
import type { QuizType } from "@prisma/client";

interface QuizResult {
  quizId: string;
  quizTitle: string;
  type: QuizType;
  materiId: string;
  materiTitle: string;
  avgScore: number;
  totalQuestions: number;
  answeredQuestions: number;
}

interface ResultFilters {
  materiId?: string;
  type?: QuizType;
}

export const getStudentQuizResults = unstable_cache(
  async (studentId: string, filters: ResultFilters = {}): Promise<QuizResult[]> => {
    try {
      const quizzes = await prisma.quiz.findMany({
        where: {
          materiId: filters.materiId,
          type: filters.type,
          status: true
        },
        include: {
          materiRef: {
            select: {
              judul: true
            }
          }
        }
      });

      const results = await Promise.all(
        quizzes.map(async (quiz) => {
          let avgScore = 0;
          let totalQuestions = 0;
          let answeredQuestions = 0;

          if (quiz.type === 'MULTIPLE_CHOICE') {
            const pgAnswers = await prisma.soalPg.findMany({
              where: { quizId: quiz.id },
              include: {
                jawabanPg: {
                  where: { studentId }
                }
              }
            });

            totalQuestions = pgAnswers.length;
            answeredQuestions = pgAnswers.filter(s => s.jawabanPg.length > 0).length;

            if (answeredQuestions > 0) {
              const scores = pgAnswers.flatMap(s => s.jawabanPg.map(j => j.nilai));
              avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
            }
          } else {
            const essayAnswers = await prisma.soalEssay.findMany({
              where: { quizId: quiz.id },
              include: {
                jawabanEssay: {
                  where: { 
                    studentId,
                    nilai: { not: null }
                  }
                }
              }
            });

            totalQuestions = essayAnswers.length;
            answeredQuestions = essayAnswers.filter(s => s.jawabanEssay.length > 0).length;

            if (answeredQuestions > 0) {
              const scores = essayAnswers.flatMap(s => s.jawabanEssay.map(j => j.nilai ?? 0));
              avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
            }
          }

          return {
            quizId: quiz.id,
            quizTitle: quiz.judul,
            type: quiz.type,
            materiId: quiz.materiId,
            materiTitle: quiz.materiRef.judul,
            avgScore,
            totalQuestions,
            answeredQuestions
          };
        })
      );

      return results;
    } catch (e) {
      console.error("Get Student Quiz Results Error:", e);
      throw new ApiError("FETCH_FAILED", "Gagal mengambil hasil quiz", 500);
    }
  },
  ['student-quiz-results'],
  {
    revalidate: 60,
    tags: ['quiz-results']
  }
);