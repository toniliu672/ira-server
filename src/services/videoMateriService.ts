// src/services/videoMateriService.ts

import { cache } from "react";
import { videoMateriRepository } from "@/repositories/videoMateriRepository";
import { ApiError } from "@/lib/errors";
import type { Prisma } from "@prisma/client";

interface VideoMateriFilters {
  materiId: string;
  search?: string;
  status?: boolean;
}

export const getVideoMateriByMateriId = cache(
  async (filters: VideoMateriFilters) => {
    try {
      return await videoMateriRepository.findByMateriId(filters);
    } catch (e) {
      if (e instanceof ApiError) throw e;
      console.error("Get VideoMateri By MateriId Error:", e);
      throw new ApiError(
        "FETCH_FAILED",
        "Gagal mengambil data video materi",
        500
      );
    }
  }
);

export const getVideoMateriById = cache(async (id: string) => {
  try {
    const videoMateri = await videoMateriRepository.findById(id);
    if (!videoMateri) {
      throw new ApiError("NOT_FOUND", "Video materi tidak ditemukan", 404);
    }
    return videoMateri;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error("Get VideoMateri By ID Error:", e);
    throw new ApiError(
      "FETCH_FAILED",
      "Gagal mengambil data video materi",
      500
    );
  }
});

export const createVideoMateri = async (
  input: Prisma.VideoMateriCreateInput
) => {
  try {
    const materiId = input.materiRef.connect?.id;
    if (!materiId) {
      throw new ApiError("VALIDATION_ERROR", "MateriId is required", 400);
    }

    const lastVideos = await videoMateriRepository.findByMateriId({
      materiId,
      status: true,
    });

    const urutan =
      lastVideos.length > 0
        ? Math.max(...lastVideos.map((v) => v.urutan)) + 1
        : 1;

    return await videoMateriRepository.create({
      ...input,
      urutan,
    });
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error("Create VideoMateri Error:", e);
    throw new ApiError("CREATE_FAILED", "Gagal membuat video materi baru", 500);
  }
};

export const updateVideoMateri = async (
  id: string,
  data: Prisma.VideoMateriUpdateInput
) => {
  try {
    const currentVideo = await videoMateriRepository.findById(id);
    if (!currentVideo) {
      throw new ApiError("NOT_FOUND", "Video materi tidak ditemukan", 404);
    }

    return await videoMateriRepository.update(id, data);
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error("Update VideoMateri Error:", e);
    throw new ApiError("UPDATE_FAILED", "Gagal mengupdate video materi", 500);
  }
};

export const deleteVideoMateri = async (id: string) => {
  try {
    await videoMateriRepository.delete(id);
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error("Delete VideoMateri Error:", e);
    throw new ApiError("DELETE_FAILED", "Gagal menghapus video materi", 500);
  }
};

export const reorderVideoMateri = async (
  materiId: string,
  orderedIds: string[]
) => {
  try {
    await Promise.all(
      orderedIds.map((id, index) =>
        videoMateriRepository.update(id, { urutan: index + 1 })
      )
    );
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error("Reorder VideoMateri Error:", e);
    throw new ApiError(
      "UPDATE_FAILED",
      "Gagal mengatur ulang urutan video materi",
      500
    );
  }
};
