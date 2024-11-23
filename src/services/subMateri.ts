// src/services/subMateriService.ts

import { cache } from "react";
import { subMateriRepository } from "@/repositories/subMateriRepository";
import type { Prisma } from "@prisma/client";
import { ApiError } from "@/lib/errors";

interface SubMateriFilters {
  materiId: string;
  search?: string;
  status?: boolean;
}

export const getSubMateriByMateriId = cache(async (filters: SubMateriFilters) => {
  try {
    return await subMateriRepository.findByMateriId(filters);
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error("Get SubMateri By MateriId Error:", e);
    throw new ApiError("FETCH_FAILED", "Gagal mengambil data sub materi", 500);
  }
});

export const getSubMateriById = cache(async (id: string) => {
  try {
    const subMateri = await subMateriRepository.findById(id);
    if (!subMateri) {
      throw new ApiError("NOT_FOUND", "Sub materi tidak ditemukan", 404);
    }
    return subMateri;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error("Get SubMateri By ID Error:", e);
    throw new ApiError("FETCH_FAILED", "Gagal mengambil data sub materi", 500);
  }
});

export const createSubMateri = async (data: Prisma.SubMateriCreateInput) => {
    try {
      // Ensure materiId exists and is string
      const materiId = data.materiRef.connect?.id;
      if (!materiId) {
        throw new ApiError("VALIDATION_ERROR", "MateriId is required", 400);
      }
  
      // Validate if materi exists
      const lastSubMateri = await subMateriRepository.findByMateriId({
        materiId,
        status: true
      });
  
      // Set urutan to last + 1 or 1 if no submateri exists
      const urutan = lastSubMateri.length > 0 
        ? Math.max(...lastSubMateri.map(sm => sm.urutan)) + 1 
        : 1;
  
      return await subMateriRepository.create({
        ...data,
        urutan
      });
    } catch (e) {
      if (e instanceof ApiError) throw e;
      console.error("Create SubMateri Error:", e);
      throw new ApiError("CREATE_FAILED", "Gagal membuat sub materi baru", 500);
    }
  };
export const updateSubMateri = async (id: string, data: Prisma.SubMateriUpdateInput) => {
  try {
    return await subMateriRepository.update(id, data);
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error("Update SubMateri Error:", e);
    throw new ApiError("UPDATE_FAILED", "Gagal mengupdate sub materi", 500);
  }
};

export const deleteSubMateri = async (id: string) => {
  try {
    await subMateriRepository.delete(id);
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error("Delete SubMateri Error:", e);
    throw new ApiError("DELETE_FAILED", "Gagal menghapus sub materi", 500);
  }
};

export const reorderSubMateri = async (materiId: string, orderedIds: string[]) => {
  try {
    await Promise.all(
      orderedIds.map((id, index) => 
        subMateriRepository.update(id, { urutan: index + 1 })
      )
    );
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error("Reorder SubMateri Error:", e);
    throw new ApiError("UPDATE_FAILED", "Gagal mengatur ulang urutan sub materi", 500);
  }
};