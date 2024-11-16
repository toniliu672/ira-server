// src/repositories/materiRepository.ts

import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { ApiError } from "@/lib/errors";
import type { MateriFilters } from "@/types/materi";

export class MateriRepository {
  async findById(id: string) {
    try {
      return await prisma.materi.findUnique({
        where: { id },
        include: {
          subMateri: {
            orderBy: { urutan: 'asc' }
          }
        }
      });
    } catch (e) {
      const error = e as Error;
      console.error("Repository Find Materi By ID Error:", error.message);
      throw new ApiError("FETCH_FAILED", "Gagal mengambil data materi", 500);
    }
  }

  async findMany(filters: MateriFilters) {
    const {
      search = "",
      page = 1,
      limit = 10,
      sortBy = "urutan",
      sortOrder = "asc",
      status
    } = filters;

    try {
      const where: Prisma.MateriWhereInput = {
        AND: [
          search ? {
            OR: [
              { judul: { contains: search, mode: 'insensitive' } },
              { deskripsi: { contains: search, mode: 'insensitive' } }
            ]
          } : {},
          status !== undefined ? { status } : {}
        ]
      };

      const [materi, total] = await prisma.$transaction([
        prisma.materi.findMany({
          where,
          include: {
            subMateri: {
              orderBy: { urutan: 'asc' }
            }
          },
          orderBy: { [sortBy]: sortOrder },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.materi.count({ where })
      ]);

      return { materi, total };
    } catch (e) {
      const error = e as Error;
      console.error("Repository Find Many Materi Error:", error.message);
      throw new ApiError("FETCH_FAILED", "Gagal mengambil data materi", 500);
    }
  }

  async create(data: Prisma.MateriCreateInput) {
    try {
      return await prisma.materi.create({
        data,
        include: {
          subMateri: true
        }
      });
    } catch (e) {
      const error = e as Error;
      console.error("Repository Create Materi Error:", error.message);
      
      if (error.message.includes("Unique constraint")) {
        throw new ApiError("DUPLICATE_ENTRY", "Judul materi sudah digunakan", 409);
      }
      
      throw new ApiError("CREATE_FAILED", "Gagal membuat materi baru", 500);
    }
  }

  async update(id: string, data: Prisma.MateriUpdateInput) {
    try {
      return await prisma.materi.update({
        where: { id },
        data,
        include: {
          subMateri: {
            orderBy: { urutan: 'asc' }
          }
        }
      });
    } catch (e) {
      const error = e as Error;
      console.error("Repository Update Materi Error:", error.message);
      
      if (error.message.includes("Record to update not found")) {
        throw new ApiError("NOT_FOUND", "Materi tidak ditemukan", 404);
      }
      
      if (error.message.includes("Unique constraint")) {
        throw new ApiError("DUPLICATE_ENTRY", "Judul materi sudah digunakan", 409);
      }
      
      throw new ApiError("UPDATE_FAILED", "Gagal mengupdate materi", 500);
    }
  }

  async delete(id: string) {
    try {
      await prisma.materi.delete({
        where: { id }
      });
    } catch (e) {
      const error = e as Error;
      console.error("Repository Delete Materi Error:", error.message);
      
      if (error.message.includes("Record to delete does not exist")) {
        throw new ApiError("NOT_FOUND", "Materi tidak ditemukan", 404);
      }
      
      throw new ApiError("DELETE_FAILED", "Gagal menghapus materi", 500);
    }
  }

  async count(status?: boolean) {
    try {
      return await prisma.materi.count({
        where: status !== undefined ? { status } : undefined
      });
    } catch (e) {
      const error = e as Error;
      console.error("Repository Count Materi Error:", error.message);
      throw new ApiError("FETCH_FAILED", "Gagal menghitung jumlah materi", 500);
    }
  }
}

// Singleton instance
export const materiRepository = new MateriRepository();