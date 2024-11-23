// src/repositories/videoMateriRepository.ts

import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { ApiError } from "@/lib/errors";

interface VideoMateriFilters {
  materiId: string;
  search?: string;
  status?: boolean;
}

export class VideoMateriRepository {
  async findById(id: string) {
    try {
      return await prisma.videoMateri.findUnique({
        where: { id }
      });
    } catch (e) {
      console.error("Repository Find VideoMateri By ID Error:", e);
      throw new ApiError("FETCH_FAILED", "Gagal mengambil data video materi", 500);
    }
  }

  async findByMateriId(filters: VideoMateriFilters) {
    const { materiId, search = "", status = true } = filters;

    try {
      const where: Prisma.VideoMateriWhereInput = {
        AND: [
          { materiId },
          search ? {
            judul: { contains: search, mode: "insensitive" }
          } : {},
          { status }
        ]
      };

      return await prisma.videoMateri.findMany({
        where,
        orderBy: { urutan: "asc" }
      });
    } catch (e) {
      console.error("Repository Find VideoMateri By MateriId Error:", e);
      throw new ApiError("FETCH_FAILED", "Gagal mengambil data video materi", 500);
    }
  }

  async create(data: Prisma.VideoMateriCreateInput) {
    try {
      return await prisma.videoMateri.create({
        data
      });
    } catch (e) {
      console.error("Repository Create VideoMateri Error:", e);
      throw new ApiError("CREATE_FAILED", "Gagal membuat video materi baru", 500);
    }
  }

  async update(id: string, data: Prisma.VideoMateriUpdateInput) {
    try {
      return await prisma.videoMateri.update({
        where: { id },
        data
      });
    } catch (e) {
      console.error("Repository Update VideoMateri Error:", e);
      
      if (e instanceof Error && e.message.includes("Record to update not found")) {
        throw new ApiError("NOT_FOUND", "Video materi tidak ditemukan", 404);
      }
      
      throw new ApiError("UPDATE_FAILED", "Gagal mengupdate video materi", 500);
    }
  }

  async delete(id: string) {
    try {
      await prisma.videoMateri.delete({
        where: { id }
      });
    } catch (e) {
      console.error("Repository Delete VideoMateri Error:", e);
      
      if (e instanceof Error && e.message.includes("Record to delete does not exist")) {
        throw new ApiError("NOT_FOUND", "Video materi tidak ditemukan", 404);
      }
      
      throw new ApiError("DELETE_FAILED", "Gagal menghapus video materi", 500);
    }
  }
}

export const videoMateriRepository = new VideoMateriRepository();