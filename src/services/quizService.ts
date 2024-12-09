// src/services/quizService.ts

import { unstable_cache } from "next/cache";
import type { Quiz, QuizFilters, QuizStats } from "@/types/quiz";
import { quizRepository } from "@/repositories/quizRepository";
import { ApiError } from "@/lib/errors";

export const getQuizzes = unstable_cache(
  async (filters: QuizFilters) => {
    try {
      return await quizRepository.findMany(filters);
    } catch (e) {
      if (e instanceof ApiError) throw e;
      console.error("Get Quizzes Error:", e);
      throw new ApiError("FETCH_FAILED", "Gagal mengambil data quiz", 500);
    }
  },
  ["quizzes"],
  {
    revalidate: 10,
    tags: ["quiz-list"],
  }
);

export const getQuizById = unstable_cache(
  async (id: string): Promise<Quiz> => {
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
  },
  ["quiz-detail"],
  {
    revalidate: 10,
    tags: ["quiz-detail"],
  }
);

export const createQuiz = async (data: Quiz): Promise<Quiz> => {
  try {
    const { materiId, ...quizData } = data;

    const createInput = {
      ...quizData,
      materiId,
    };

    const quiz = await quizRepository.create(createInput);
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

export const getQuizStats = unstable_cache(
  async (): Promise<QuizStats> => {
    try {
      return await quizRepository.getStats();
    } catch (e) {
      console.error("Get Quiz Stats Error:", e);
      throw new ApiError("FETCH_FAILED", "Gagal mengambil statistik quiz", 500);
    }
  },
  ["quiz-stats"],
  {
    revalidate: 30,
    tags: ["quiz-stats"],
  }
);