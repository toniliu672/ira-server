// src/repositories/quizRepository.ts

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
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
            orderBy: { id: "asc" },
          },
          soalEssay: {
            where: { status: true },
            orderBy: { id: "asc" },
          },
        },
      });
    } catch (e) {
      console.error("Repository Find Quiz By ID Error:", e);
      throw new ApiError("FETCH_FAILED", "Gagal mengambil data quiz", 500);
    }
  }

  async findMany(filters: QuizFilters) {
    const {
      search = "",
      type,
      materiId,
      page = 1,
      limit = 10,
      sortBy = "judul",
      sortOrder = "asc",
      status = true,
    } = filters;

    try {
      const where: Prisma.QuizWhereInput = {
        AND: [
          search
            ? {
                OR: [
                  { judul: { contains: search, mode: "insensitive" } },
                  { deskripsi: { contains: search, mode: "insensitive" } },
                ],
              }
            : {},
          type ? { type } : {},
          materiId ? { materiId } : {},
          { status },
        ],
      };

      const [quizzes, total] = await prisma.$transaction([
        prisma.quiz.findMany({
          where,
          include: {
            _count: {
              select: {
                soalPg: true,
                soalEssay: true,
              },
            },
          },
          orderBy: { [sortBy]: sortOrder },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.quiz.count({ where }),
      ]);

      return { quizzes, total };
    } catch (e) {
      console.error("Repository Find Many Quizzes Error:", e);
      throw new ApiError("FETCH_FAILED", "Gagal mengambil data quiz", 500);
    }
  }

  async create(data: Omit<Prisma.QuizCreateInput, 'materiRef'> & { materiId: string }) {
    try {
      const { materiId, ...quizData } = data;

      // Validasi data
      if (!materiId || !quizData.judul || !quizData.type) {
        throw new ApiError(
          "VALIDATION_ERROR",
          "Data quiz tidak lengkap",
          400
        );
      }

      // Cek apakah materi exists
      const materi = await prisma.materi.findUnique({
        where: { id: materiId }
      });

      if (!materi) {
        throw new ApiError(
          "NOT_FOUND",
          "Materi tidak ditemukan",
          404
        );
      }

      return await prisma.quiz.create({
        data: {
          ...quizData,
          materiRef: {
            connect: { id: materiId }
          }
        },
        include: {
          materiRef: {
            select: {
              judul: true
            }
          },
          _count: {
            select: {
              soalPg: true,
              soalEssay: true
            }
          }
        }
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new ApiError(
            "DUPLICATE_ENTRY",
            "Quiz dengan judul tersebut sudah ada",
            409
          );
        }
      }
      if (e instanceof ApiError) throw e;
      console.error("Repository Create Quiz Error:", e);
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
          soalEssay: true,
        },
      });
    } catch (e) {
      console.error("Repository Update Quiz Error:", e);

      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2025") {
          throw new ApiError("NOT_FOUND", "Quiz tidak ditemukan", 404);
        }
      }

      throw new ApiError("UPDATE_FAILED", "Gagal mengupdate quiz", 500);
    }
  }

  async delete(id: string) {
    try {
      await prisma.quiz.delete({
        where: { id },
      });
    } catch (e) {
      console.error("Repository Delete Quiz Error:", e);

      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2025") {
          throw new ApiError("NOT_FOUND", "Quiz tidak ditemukan", 404);
        }
      }

      throw new ApiError("DELETE_FAILED", "Gagal menghapus quiz", 500);
    }
  }

  async getStats() {
    try {
      const [total, multipleChoice, essay, active] = await prisma.$transaction([
        prisma.quiz.count(),
        prisma.quiz.count({ where: { type: "MULTIPLE_CHOICE" } }),
        prisma.quiz.count({ where: { type: "ESSAY" } }),
        prisma.quiz.count({ where: { status: true } }),
      ]);

      return { total, multipleChoice, essay, active };
    } catch (e) {
      console.error("Repository Get Quiz Stats Error:", e);
      throw new ApiError("FETCH_FAILED", "Gagal mengambil statistik quiz", 500);
    }
  }
}

// Singleton instance
export const quizRepository = new QuizRepository();
