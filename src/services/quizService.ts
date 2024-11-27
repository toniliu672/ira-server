// src/services/quizService.ts

import { cache } from "react";
import type {
  Quiz,
  QuizFilters,
} from "@/types/quiz";
import { quizRepository } from "@/repositories/quizRepository";
import { ApiError } from "@/lib/errors";
import type { Prisma } from "@prisma/client";

export const getQuizzes = cache(async (filters: QuizFilters) => {
  try {
    return await quizRepository.findMany(filters);
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error("Get Quizzes Error:", e);
    throw new ApiError("FETCH_FAILED", "Gagal mengambil data quiz", 500);
  }
});

export const getQuizById = cache(async (id: string) => {
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

export const createQuiz = async (data: Quiz) => {
  try {
    const quizData: Prisma.QuizCreateInput = {
      judul: data.judul,
      deskripsi: data.deskripsi,
      type: data.type,
      status: data.status,
      materiRef: {
        connect: { id: data.materiId }
      }
    };
    
    return await quizRepository.create(quizData);
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error("Create Quiz Error:", e);
    throw new ApiError("CREATE_FAILED", "Gagal membuat quiz", 500);
  }
};

export const updateQuiz = async (id: string, data: Partial<Quiz>) => {
  try {
    const updateData: Prisma.QuizUpdateInput = {
      judul: data.judul,
      deskripsi: data.deskripsi,
      type: data.type,
      status: data.status,
      ...(data.materiId && {
        materiRef: {
          connect: { id: data.materiId }
        }
      })
    };

    return await quizRepository.update(id, updateData);
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error("Update Quiz Error:", e);
    throw new ApiError("UPDATE_FAILED", "Gagal mengupdate quiz", 500);
  }
};

export const deleteQuiz = async (id: string) => {
  try {
    await quizRepository.delete(id);
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error("Delete Quiz Error:", e);
    throw new ApiError("DELETE_FAILED", "Gagal menghapus quiz", 500);
  }
};

// Fungsi untuk mengambil soal random untuk mobile app
export const getRandomQuizQuestions = cache(async (quizId: string) => {
  try {
    const quiz = await quizRepository.findById(quizId);
    if (!quiz) {
      throw new ApiError("NOT_FOUND", "Quiz tidak ditemukan", 404);
    }

    if (quiz.type === "MULTIPLE_CHOICE") {
      // Ambil 10 soal random untuk pilihan ganda
      const randomQuestions = await quizRepository.getRandomSoalPg(quizId, 10);
      return randomQuestions;
    }

    // Untuk essay, kembalikan semua soal essay yang aktif
    return quiz.soalEssay.filter(soal => soal.status);
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error("Get Random Quiz Questions Error:", e);
    throw new ApiError("FETCH_FAILED", "Gagal mengambil soal quiz", 500);
  }
});