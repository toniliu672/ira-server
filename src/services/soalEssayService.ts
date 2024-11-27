// src/services/soalEssayService.ts

import { cache } from "react";
import type { SoalEssay } from "@/types/quiz";
import prisma from "@/lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ApiError } from "@/lib/errors";

export const getSoalEssayById = cache(async (id: string): Promise<SoalEssay> => {
  try {
    const soal = await prisma.soalEssay.findUnique({
      where: { id }
    });

    if (!soal) {
      throw new ApiError("NOT_FOUND", "Soal tidak ditemukan", 404);
    }

    return soal;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error("Get Soal Essay By ID Error:", e);
    throw new ApiError("FETCH_FAILED", "Gagal mengambil data soal", 500);
  }
});

export const getSoalEssayByQuizId = cache(async (quizId: string, status: boolean = true) => {
  try {
    const soal = await prisma.soalEssay.findMany({
      where: { 
        quizId,
        status 
      },
      orderBy: { id: 'asc' }
    });

    return soal;
  } catch (e) {
    console.error("Get Soal Essay By Quiz ID Error:", e);
    throw new ApiError("FETCH_FAILED", "Gagal mengambil data soal", 500);
  }
});

export const createSoalEssay = async (data: Omit<SoalEssay, "id">): Promise<SoalEssay> => {
  try {
    // Verify quiz exists and is essay type
    const quiz = await prisma.quiz.findUnique({
      where: { id: data.quizId }
    });

    if (!quiz) {
      throw new ApiError("NOT_FOUND", "Quiz tidak ditemukan", 404);
    }

    if (quiz.type !== 'ESSAY') {
      throw new ApiError("INVALID_OPERATION", "Quiz bukan tipe essay", 400);
    }

    const soal = await prisma.soalEssay.create({
      data: {
        pertanyaan: data.pertanyaan,
        status: data.status,
        quizId: data.quizId
      }
    });

    return soal;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error("Create Soal Essay Error:", e);
    throw new ApiError("CREATE_FAILED", "Gagal membuat soal", 500);
  }
};

export const updateSoalEssay = async (id: string, data: Partial<Omit<SoalEssay, "id" | "quizId">>): Promise<SoalEssay> => {
  try {
    const soal = await prisma.soalEssay.update({
      where: { id },
      data
    });

    return soal;
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError) {
      if (e.code === 'P2025') {
        throw new ApiError("NOT_FOUND", "Soal tidak ditemukan", 404);
      }
    }
    console.error("Update Soal Essay Error:", e);
    throw new ApiError("UPDATE_FAILED", "Gagal mengupdate soal", 500);
  }
};

export const deleteSoalEssay = async (id: string): Promise<void> => {
  try {
    await prisma.soalEssay.delete({
      where: { id }
    });
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError) {
      if (e.code === 'P2025') {
        throw new ApiError("NOT_FOUND", "Soal tidak ditemukan", 404);
      }
    }
    console.error("Delete Soal Essay Error:", e);
    throw new ApiError("DELETE_FAILED", "Gagal menghapus soal", 500);
  }
};