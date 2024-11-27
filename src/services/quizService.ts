// src/services/quizService.ts

import { cache } from "react";
import type { Quiz, QuizFilters, QuizStats } from "@/types/quiz";
import { quizRepository } from "@/repositories/quizRepository";
import { ApiError } from "@/lib/errors";

export const getQuizzes = cache(async (filters: QuizFilters) => {
  try {
    return await quizRepository.findMany(filters);
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error("Get Quizzes Error:", e);
    throw new ApiError("FETCH_FAILED", "Gagal mengambil data quiz", 500);
  }
});

export const getQuizById = cache(async (id: string): Promise<Quiz> => {
  try {
    const quiz = await quizRepository.findById(id);
    if (!quiz) {
      throw new ApiError("NOT_FOUND", "Quiz tidak ditemukan", 404);
    }
    return quiz;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error("Get Quiz By ID Error:", e);
    throw new ApiError("FETCH_FAILED", "Gagal mengambil data quiz", 500);
  }
});

export const createQuiz = async (data: Quiz): Promise<Quiz> => {
  try {
    // Check if materi exists (can be added if needed)
    const quiz = await quizRepository.create({
      ...data,
      materiRef: {
        connect: { id: data.materiId },
      },
    });
    return quiz;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error("Create Quiz Error:", e);
    throw new ApiError("CREATE_FAILED", "Gagal membuat quiz", 500);
  }
};

export const updateQuiz = async (
  id: string,
  data: Partial<Quiz>
): Promise<Quiz> => {
  try {
    const quiz = await quizRepository.update(id, data);
    return quiz;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error("Update Quiz Error:", e);
    throw new ApiError("UPDATE_FAILED", "Gagal mengupdate quiz", 500);
  }
};

export const deleteQuiz = async (id: string): Promise<void> => {
  try {
    await quizRepository.delete(id);
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error("Delete Quiz Error:", e);
    throw new ApiError("DELETE_FAILED", "Gagal menghapus quiz", 500);
  }
};

export const getQuizStats = cache(async (): Promise<QuizStats> => {
  try {
    return await quizRepository.getStats();
  } catch (e) {
    console.error("Get Quiz Stats Error:", e);
    throw new ApiError("FETCH_FAILED", "Gagal mengambil statistik quiz", 500);
  }
});

// Additional service methods for soal management
export const getRandomSoalPg = cache(
  async (quizId: string, count: number = 10) => {
    try {
      const quiz = await quizRepository.findById(quizId);
      if (!quiz) {
        throw new ApiError("NOT_FOUND", "Quiz tidak ditemukan", 404);
      }

      if (quiz.type !== "MULTIPLE_CHOICE") {
        throw new ApiError(
          "INVALID_TYPE",
          "Quiz bukan tipe pilihan ganda",
          400
        );
      }

      // Get active soal and randomize
      const activeSoal = quiz.soalPg.filter((soal) => soal.status);
      const randomSoal = activeSoal
        .sort(() => Math.random() - 0.5)
        .slice(0, count);

      return randomSoal;
    } catch (e) {
      if (e instanceof ApiError) throw e;
      console.error("Get Random Soal PG Error:", e);
      throw new ApiError("FETCH_FAILED", "Gagal mengambil soal quiz", 500);
    }
  }
);
