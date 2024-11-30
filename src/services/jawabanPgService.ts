// src/services/jawabanPgService.ts

import type { JawabanPg } from "@/types/quiz";
import prisma from "@/lib/prisma";
import { ApiError } from "@/lib/errors";
import { unstable_cache } from "next/cache";
import { PrismaClient } from "@prisma/client";

type CreateJawabanPgInput = Omit<JawabanPg, "id" | "isCorrect" | "nilai">;

export async function createJawabanPg(data: CreateJawabanPgInput): Promise<JawabanPg> {
  try {
    // Verify soal exists and is active
    const soal = await prisma.soalPg.findUnique({
      where: { id: data.soalId },
      select: { status: true, kunciJawaban: true }
    });

    if (!soal || !soal.status) {
      throw new ApiError("NOT_FOUND", "Soal tidak ditemukan atau tidak aktif", 404);
    }

    // Start transaction
    return await prisma.$transaction(async (tx) => {
      // Set previous attempts to not latest
      await tx.jawabanPg.updateMany({
        where: {
          studentId: data.studentId,
          soalId: data.soalId,
          latestAttempt: true
        },
        data: {
          latestAttempt: false
        }
      });

      // Get attempt count
      const prevAttempt = await tx.jawabanPg.findFirst({
        where: {
          studentId: data.studentId,
          soalId: data.soalId
        },
        orderBy: {
          attemptCount: 'desc'
        },
        select: {
          attemptCount: true
        }
      });

      // Calculate if answer is correct
      const isCorrect = data.jawaban === soal.kunciJawaban;
      const nilai = isCorrect ? 1 : 0;

      // Create new answer
      const jawaban = await tx.jawabanPg.create({
        data: {
          studentId: data.studentId,
          soalId: data.soalId,
          jawaban: data.jawaban,
          isCorrect,
          nilai,
          attemptCount: (prevAttempt?.attemptCount ?? 0) + 1,
          latestAttempt: true
        }
      });

      // Update student's average PG score using only latest attempts
      await updateStudentPgScore(data.studentId, tx as PrismaClient);

      return jawaban;
    });

  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error("Create Jawaban PG Error:", e);
    throw new ApiError("CREATE_FAILED", "Gagal menyimpan jawaban", 500);
  }
}

async function updateStudentPgScore(studentId: string, tx = prisma): Promise<void> {
  // Calculate average score only from latest attempts
  const avgScore = await tx.jawabanPg.aggregate({
    where: { 
      studentId,
      latestAttempt: true 
    },
    _avg: { nilai: true }
  });

  await tx.student.update({
    where: { id: studentId },
    data: { nilaiPg: avgScore._avg.nilai || 0 }
  });
}

export const getStudentPgAnswers = unstable_cache(
  async (studentId: string, quizId?: string) => {
    const where = {
      studentId,
      soalRef: quizId ? {
        quizId
      } : undefined
    };

    return prisma.jawabanPg.findMany({
      where,
      include: {
        soalRef: {
          select: {
            pertanyaan: true,
            quizId: true
          }
        }
      }
    });
  },
  ['student-pg-answers'],
  {
    revalidate: 60,
    tags: ['jawaban-pg']
  }
);