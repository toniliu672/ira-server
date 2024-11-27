// src/repositories/quizRepository.ts

import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { ApiError } from "@/lib/errors";
import type { QuizFilters } from "@/types/quiz";

export class QuizRepository {
  async findById(id: string) {
    try {
      return await prisma.quiz.findUnique({
        where: { id },
        include: {
          soalPg: {
            where: { status: true },
            orderBy: { id: 'asc' }
          },
          soalEssay: {
            where: { status: true },
            orderBy: { id: 'asc' }
          }
        }
      });
    } catch (e) {
      const error = e as Error;
      console.error("Repository Find Quiz By ID Error:", error.message);
      throw new ApiError("FETCH_FAILED", "Gagal mengambil data quiz", 500);
    }
  }

  async findMany(filters: QuizFilters) {
    const {
      search = "",
      materiId,
      type,
      status = true,
      page = 1,
      limit = 10,
      sortBy = "judul",
      sortOrder = "asc"
    } = filters;

    try {
      const where: Prisma.QuizWhereInput = {
        AND: [
          search
            ? {
                judul: { contains: search, mode: "insensitive" }
              }
            : {},
          materiId ? { materiId } : {},
          type ? { type } : {},
          { status }
        ]
      };

      const [quizzes, total] = await prisma.$transaction([
        prisma.quiz.findMany({
          where,
          include: {
            _count: {
              select: {
                soalPg: true,
                soalEssay: true
              }
            }
          },
          orderBy: { [sortBy]: sortOrder },
          skip: (page - 1) * limit,
          take: limit
        }),
        prisma.quiz.count({ where })
      ]);

      return { quizzes, total };
    } catch (e) {
      const error = e as Error;
      console.error("Repository Find Many Quiz Error:", error.message);
      throw new ApiError("FETCH_FAILED", "Gagal mengambil data quiz", 500);
    }
  }

  async create(data: Prisma.QuizCreateInput) {
    try {
      return await prisma.quiz.create({
        data,
        include: {
          soalPg: true,
          soalEssay: true
        }
      });
    } catch (e) {
      const error = e as Error;
      console.error("Repository Create Quiz Error:", error.message);
      throw new ApiError("CREATE_FAILED", "Gagal membuat quiz", 500);
    }
  }

  async update(id: string, data: Prisma.QuizUpdateInput) {
    try {
      return await prisma.quiz.update({
        where: { id },
        data,
        include: {
          soalPg: true,
          soalEssay: true
        }
      });
    } catch (e) {
      const error = e as Error;
      console.error("Repository Update Quiz Error:", error.message);
      
      if (error.message.includes("Record to update not found")) {
        throw new ApiError("NOT_FOUND", "Quiz tidak ditemukan", 404);
      }
      
      throw new ApiError("UPDATE_FAILED", "Gagal mengupdate quiz", 500);
    }
  }

  async delete(id: string) {
    try {
      await prisma.quiz.delete({ where: { id } });
    } catch (e) {
      const error = e as Error;
      console.error("Repository Delete Quiz Error:", error.message);
      
      if (error.message.includes("Record to delete does not exist")) {
        throw new ApiError("NOT_FOUND", "Quiz tidak ditemukan", 404);
      }
      
      throw new ApiError("DELETE_FAILED", "Gagal menghapus quiz", 500);
    }
  }

  async getRandomSoalPg(quizId: string, count: number) {
    try {
      return await prisma.soalPg.findMany({
        where: {
          quizId,
          status: true
        },
        take: count,
        orderBy: {
          id: 'asc'
        }
      });
    } catch (e) {
      const error = e as Error;
      console.error("Repository Get Random Soal PG Error:", error.message);
      throw new ApiError("FETCH_FAILED", "Gagal mengambil soal quiz", 500);
    }
  }
}

export const quizRepository = new QuizRepository();