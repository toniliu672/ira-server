// src/repositories/subMateriRepository.ts

import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { ApiError } from "@/lib/errors";

interface SubMateriFilters {
  materiId: string;
  search?: string;
  status?: boolean;
}

export class SubMateriRepository {
  async findById(id: string) {
    try {
      return await prisma.subMateri.findUnique({
        where: { id }
      });
    } catch (e) {
      console.error("Repository Find SubMateri By ID Error:", e);
      throw new ApiError("FETCH_FAILED", "Gagal mengambil data sub materi", 500);
    }
  }

  async findByMateriId(filters: SubMateriFilters) {
    const { materiId, search = "", status = true } = filters;

    try {
      const where: Prisma.SubMateriWhereInput = {
        AND: [
          { materiId },
          search ? {
            judul: { contains: search, mode: "insensitive" }
          } : {},
          { status }
        ]
      };

      return await prisma.subMateri.findMany({
        where,
        orderBy: { urutan: "asc" }
      });
    } catch (e) {
      console.error("Repository Find SubMateri By MateriId Error:", e);
      throw new ApiError("FETCH_FAILED", "Gagal mengambil data sub materi", 500);
    }
  }

  async create(data: Prisma.SubMateriCreateInput) {
    try {
      return await prisma.subMateri.create({
        data
      });
    } catch (e) {
      console.error("Repository Create SubMateri Error:", e);
      throw new ApiError("CREATE_FAILED", "Gagal membuat sub materi baru", 500);
    }
  }

  async update(id: string, data: Prisma.SubMateriUpdateInput) {
    try {
      return await prisma.subMateri.update({
        where: { id },
        data
      });
    } catch (e) {
      console.error("Repository Update SubMateri Error:", e);
      
      if (e instanceof Error && e.message.includes("Record to update not found")) {
        throw new ApiError("NOT_FOUND", "Sub materi tidak ditemukan", 404);
      }
      
      throw new ApiError("UPDATE_FAILED", "Gagal mengupdate sub materi", 500);
    }
  }

  async delete(id: string) {
    try {
      await prisma.subMateri.delete({
        where: { id }
      });
    } catch (e) {
      console.error("Repository Delete SubMateri Error:", e);
      
      if (e instanceof Error && e.message.includes("Record to delete does not exist")) {
        throw new ApiError("NOT_FOUND", "Sub materi tidak ditemukan", 404);
      }
      
      throw new ApiError("DELETE_FAILED", "Gagal menghapus sub materi", 500);
    }
  }
}

export const subMateriRepository = new SubMateriRepository();