// src/services/jawabanPgService.ts

import type { PrismaClient } from "@prisma/client";
import { ApiError } from "@/lib/errors";
import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";

interface CreateJawabanPgInput {
  studentId: string;
  soalId: string;
  jawaban: number;
}

type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

export async function createJawabanPg(
  data: CreateJawabanPgInput, 
  tx: TransactionClient = prisma
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  try {
    // Get soal to verify answer
    const soal = await tx.soalPg.findUnique({
      where: { id: data.soalId },
      select: { kunciJawaban: true, status: true }
    });

    if (!soal || !soal.status) {
      throw new ApiError("NOT_FOUND", "Soal tidak ditemukan atau tidak aktif", 404);
    }

    // Calculate if answer is correct
    const isCorrect = data.jawaban === soal.kunciJawaban;
    const nilai = isCorrect ? 1 : 0;

    // Update the answer with score
    const jawaban = await tx.jawabanPg.update({
      where: {
        id: data.soalId,
        AND: [
          { studentId: data.studentId },
          { latestAttempt: true }
        ]
      },
      data: {
        isCorrect,
        nilai
      }
    });

    return jawaban;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error("Create Jawaban PG Error:", e);
    throw new ApiError("CREATE_FAILED", "Gagal menyimpan jawaban", 500);
  }
}

export async function updateStudentPgScore(
  studentId: string, 
  tx: TransactionClient = prisma
): Promise<void> {
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
      soalRef: quizId
        ? {
            quizId,
          }
        : undefined,
    };

    return prisma.jawabanPg.findMany({
      where,
      include: {
        soalRef: {
          select: {
            pertanyaan: true,
            quizId: true,
          },
        },
      },
    });
  },
  ["student-pg-answers"],
  {
    revalidate: 60,
    tags: ["jawaban-pg"],
  }
);
