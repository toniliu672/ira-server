// src/services/materiService.ts

import { cache } from "react";
import { materiRepository } from "@/repositories/materiRepository";
import type { Prisma } from "@prisma/client";
import { ApiError } from "@/lib/errors";

interface MateriFilters {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "judul" | "urutan" | "createdAt";
  sortOrder?: "asc" | "desc";
  status?: boolean;
}

export const getMateri = cache(async (filters: MateriFilters) => {
  try {
    const result = await materiRepository.findMany(filters);
    return result;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error("Get Materi Error:", e);
    throw new ApiError("FETCH_FAILED", "Gagal mengambil data materi", 500);
  }
});

export const getMateriById = cache(async (id: string) => {
  try {
    const materi = await materiRepository.findById(id);
    if (!materi) {
      throw new ApiError("NOT_FOUND", "Materi tidak ditemukan", 404);
    }
    return materi;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error("Get Materi By ID Error:", e);
    throw new ApiError("FETCH_FAILED", "Gagal mengambil data materi", 500);
  }
});

export const createMateri = async (data: Prisma.MateriCreateInput) => {
  try {
    return await materiRepository.create(data);
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error("Create Materi Error:", e);
    throw new ApiError("CREATE_FAILED", "Gagal membuat materi baru", 500);
  }
};

export const updateMateri = async (id: string, data: Prisma.MateriUpdateInput) => {
  try {
    return await materiRepository.update(id, data);
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error("Update Materi Error:", e);
    throw new ApiError("UPDATE_FAILED", "Gagal mengupdate materi", 500);
  }
};

export const deleteMateri = async (id: string) => {
  try {
    await materiRepository.delete(id);
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error("Delete Materi Error:", e);
    throw new ApiError("DELETE_FAILED", "Gagal menghapus materi", 500);
  }
};

export const getMateriStats = cache(async () => {
  try {
    const [totalMateri, activeMateri] = await Promise.all([
      materiRepository.count(),
      materiRepository.count({ status: true })
    ]);

    return {
      total: totalMateri,
      active: activeMateri,
      inactive: totalMateri - activeMateri
    };
  } catch (e) {
    console.error("Get Materi Stats Error:", e);
    throw new ApiError("FETCH_FAILED", "Gagal mengambil statistik materi", 500);
  }
});