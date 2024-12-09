/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/quizResultService.ts

import prisma from "@/lib/prisma";
import { ApiError } from "@/lib/errors";
import { unstable_cache } from "next/cache";
import type { QuizType, Prisma } from "@prisma/client";

interface QuizResultFilters {
  search?: string;
  type?: QuizType;
  status?: 'GRADED' | 'UNGRADED';
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}


export const getQuizResults = unstable_cache(
  async (quizId: string, filters: QuizResultFilters = {}) => {
    try {
      const {
        search = '',
        status,
        page = 1,
        limit = 100,
        sortOrder = 'asc'
      } = filters;

      // Get quiz first
      const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        include: {
          materiRef: {
            select: { judul: true }
          }
        }
      });

      if (!quiz) {
        throw new ApiError("NOT_FOUND", "Quiz tidak ditemukan", 404);
      }

      // Build query based on quiz type
      const studentWhere: Prisma.StudentWhereInput = {
        AND: [
          // Search condition
          search ? {
            OR: [
              { username: { contains: search } },
              { fullName: { contains: search } }
            ]
          } : {},
          // Quiz type specific conditions
          quiz.type === 'MULTIPLE_CHOICE' ? {
            jawabanPg: {
              some: {
                soalRef: { quizId }
              }
            }
          } : {
            jawabanEssay: {
              some: {
                soalRef: { quizId },
                ...(status === 'GRADED' ? { nilai: { not: null } } : 
                   status === 'UNGRADED' ? { nilai: null } : {})
              }
            }
          }
        ]
      };

      // Get paginated students with their answers
      const students = await prisma.student.findMany({
        where: studentWhere,
        select: {
          id: true,
          username: true,
          fullName: true,
          lastLogin: true,
          jawabanPg: quiz.type === 'MULTIPLE_CHOICE' ? {
            where: { soalRef: { quizId } },
            include: { soalRef: true }
          } : undefined,
          jawabanEssay: quiz.type === 'ESSAY' ? {
            where: { soalRef: { quizId } },
            include: { soalRef: true }
          } : undefined
        },
        orderBy: { fullName: sortOrder },
        skip: (page - 1) * limit,
        take: limit
      });

      const total = await prisma.student.count({ where: studentWhere });

      // Calculate scores and format response
      const results = students.map(student => ({
        student: {
          id: student.id,
          username: student.username,
          name: student.fullName
        },
        quiz: {
          id: quiz.id,
          title: quiz.judul,
          type: quiz.type
        },
        scores: calculateStudentScores(student, quiz.type),
        submittedAt: student.lastLogin
      }));

      return {
        results,
        pagination: {
          total,
          page,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (e) {
      if (e instanceof ApiError) throw e;
      console.error("Get Quiz Results Error:", e);
      throw new ApiError("FETCH_FAILED", "Gagal mengambil hasil quiz", 500);
    }
  },
  ['quiz-results'],
  {
    revalidate: 60,
    tags: ['quiz-results']
  }
);

// Helper function to calculate student scores
function calculateStudentScores(
  student: any,
  quizType: QuizType
) {
  const answers = quizType === 'MULTIPLE_CHOICE' 
    ? student.jawabanPg || []
    : student.jawabanEssay || [];

  const totalAnswered = answers.length;
  let avgScore = 0;

  if (totalAnswered > 0) {
    const totalScore = answers.reduce((acc: number, ans: any) => 
      acc + (ans.nilai || 0), 0);
    avgScore = totalScore / totalAnswered;
  }

  return {
    answered: totalAnswered,
    avgScore,
    isComplete: quizType === 'MULTIPLE_CHOICE' ? true : 
      answers.every((ans: any) => ans.nilai !== null)
  };
}