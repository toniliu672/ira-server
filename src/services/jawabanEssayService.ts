// src/services/jawabanEssayService.ts

import type { JawabanEssay } from "@/types/quiz";
import prisma from "@/lib/prisma";
import { ApiError } from "@/lib/errors";
import { unstable_cache } from "next/cache";

type CreateJawabanEssayInput = Pick<JawabanEssay, "studentId" | "soalId" | "jawaban">;

export const createJawabanEssay = async (data: CreateJawabanEssayInput): Promise<JawabanEssay> => {
  try {
    // Verify soal exists and is active
    const soal = await prisma.soalEssay.findUnique({
      where: { id: data.soalId },
      select: { status: true }
    });

    if (!soal || !soal.status) {
      throw new ApiError("NOT_FOUND", "Soal tidak ditemukan atau tidak aktif", 404);
    }

    // Check if student has already answered
    const existing = await prisma.jawabanEssay.findFirst({
      where: {
        studentId: data.studentId,
        soalId: data.soalId
      }
    });

    if (existing) {
      throw new ApiError("DUPLICATE_ENTRY", "Soal sudah pernah dijawab", 409);
    }

    // Create answer without score
    const jawaban = await prisma.jawabanEssay.create({
      data: {
        studentId: data.studentId,
        soalId: data.soalId,
        jawaban: data.jawaban,
        nilai: null,
        feedback: null
      }
    });

    return jawaban;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error("Create Jawaban Essay Error:", e);
    throw new ApiError("CREATE_FAILED", "Gagal menyimpan jawaban", 500);
  }
};

export const updateNilaiEssay = async (
  id: string,
  nilai: number,
  feedback?: string
): Promise<JawabanEssay> => {
  try {
    // Validate nilai is between 0 and 100
    if (nilai < 0 || nilai > 100) {
      throw new ApiError("VALIDATION_ERROR", "Nilai harus antara 0 dan 100", 400);
    }

    const jawaban = await prisma.jawabanEssay.update({
      where: { id },
      data: { 
        nilai,
        feedback 
      }
    });

    // Update student's average essay score
    await updateStudentEssayScore(jawaban.studentId);

    return jawaban;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error("Update Nilai Essay Error:", e);
    throw new ApiError("UPDATE_FAILED", "Gagal mengupdate nilai", 500);
  }
};

async function updateStudentEssayScore(studentId: string): Promise<void> {
  const avgScore = await prisma.jawabanEssay.aggregate({
    where: { 
      studentId,
      nilai: { not: null }
    },
    _avg: { nilai: true }
  });

  await prisma.student.update({
    where: { id: studentId },
    data: { nilaiEssay: avgScore._avg.nilai || 0 }
  });
}

export const getStudentEssayAnswers = unstable_cache(
  async (studentId: string, quizId?: string) => {
    const where = {
      studentId,
      soalRef: quizId ? {
        quizId
      } : undefined
    };

    return prisma.jawabanEssay.findMany({
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
  ['student-essay-answers'],
  {
    revalidate: 60,
    tags: ['jawaban-essay']
  }
);