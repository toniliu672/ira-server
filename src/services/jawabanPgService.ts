// src/services/jawabanPgService.ts

import type { JawabanPg } from "@/types/quiz";
import prisma from "@/lib/prisma";
import { ApiError } from "@/lib/errors";
import { unstable_cache } from "next/cache";

type CreateJawabanPgInput = Omit<JawabanPg, "id" | "isCorrect" | "nilai">;

export const createJawabanPg = async (data: CreateJawabanPgInput): Promise<JawabanPg> => {
  try {
    // Get soal to verify answer
    const soal = await prisma.soalPg.findUnique({
      where: { id: data.soalId }
    });

    if (!soal) {
      throw new ApiError("NOT_FOUND", "Soal tidak ditemukan", 404);
    }

    // Check if student has already answered
    const existing = await prisma.jawabanPg.findFirst({
      where: {
        studentId: data.studentId,
        soalId: data.soalId
      }
    });

    if (existing) {
      throw new ApiError("DUPLICATE_ENTRY", "Soal sudah pernah dijawab", 409);
    }

    // Calculate if answer is correct
    const isCorrect = data.jawaban === soal.kunciJawaban;
    const nilai = isCorrect ? 1 : 0;

    const jawaban = await prisma.jawabanPg.create({
      data: {
        studentId: data.studentId,
        soalId: data.soalId,
        jawaban: data.jawaban,
        isCorrect,
        nilai
      }
    });

    // Update student's average score
    await updateStudentPgScore(data.studentId);

    return jawaban;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error("Create Jawaban PG Error:", e);
    throw new ApiError("CREATE_FAILED", "Gagal menyimpan jawaban", 500);
  }
};

async function updateStudentPgScore(studentId: string): Promise<void> {
  const avgScore = await prisma.jawabanPg.aggregate({
    where: { studentId },
    _avg: { nilai: true }
  });

  await prisma.student.update({
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