// src/services/soalPgService.ts

import { cache } from "react";
import type { SoalPg } from "@/types/quiz";
import prisma from "@/lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ApiError } from "@/lib/errors";

export const getSoalPgById = cache(async (id: string): Promise<SoalPg> => {
  try {
    const soal = await prisma.soalPg.findUnique({
      where: { id }
    });

    if (!soal) {
      throw new ApiError("NOT_FOUND", "Soal tidak ditemukan", 404);
    }

    return soal;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error("Get Soal PG By ID Error:", e);
    throw new ApiError("FETCH_FAILED", "Gagal mengambil data soal", 500);
  }
});

export const getSoalPgByQuizId = cache(async (quizId: string, status: boolean = true) => {
  try {
    const soal = await prisma.soalPg.findMany({
      where: { 
        quizId,
        status 
      },
      orderBy: { id: 'asc' }
    });

    return soal;
  } catch (e) {
    console.error("Get Soal PG By Quiz ID Error:", e);
    throw new ApiError("FETCH_FAILED", "Gagal mengambil data soal", 500);
  }
});

export const createSoalPg = async (data: Omit<SoalPg, "id">): Promise<SoalPg> => {
  try {
    // Verify quiz exists and is multiple choice type
    const quiz = await prisma.quiz.findUnique({
      where: { id: data.quizId }
    });

    if (!quiz) {
      throw new ApiError("NOT_FOUND", "Quiz tidak ditemukan", 404);
    }

    if (quiz.type !== 'MULTIPLE_CHOICE') {
      throw new ApiError("INVALID_OPERATION", "Quiz bukan tipe pilihan ganda", 400);
    }

    const soal = await prisma.soalPg.create({
      data: {
        pertanyaan: data.pertanyaan,
        opsiJawaban: data.opsiJawaban,
        kunciJawaban: data.kunciJawaban,
        status: data.status,
        quizId: data.quizId
      }
    });

    return soal;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error("Create Soal PG Error:", e);
    throw new ApiError("CREATE_FAILED", "Gagal membuat soal", 500);
  }
};

export const updateSoalPg = async (id: string, data: Partial<Omit<SoalPg, "id" | "quizId">>): Promise<SoalPg> => {
  try {
    const soal = await prisma.soalPg.update({
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
    console.error("Update Soal PG Error:", e);
    throw new ApiError("UPDATE_FAILED", "Gagal mengupdate soal", 500);
  }
};

export const deleteSoalPg = async (id: string): Promise<void> => {
  try {
    await prisma.soalPg.delete({
      where: { id }
    });
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError) {
      if (e.code === 'P2025') {
        throw new ApiError("NOT_FOUND", "Soal tidak ditemukan", 404);
      }
    }
    console.error("Delete Soal PG Error:", e);
    throw new ApiError("DELETE_FAILED", "Gagal menghapus soal", 500);
  }
};