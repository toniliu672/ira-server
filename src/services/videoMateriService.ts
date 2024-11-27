// src/services/videoMateriService.ts

import { cache } from "react";
import { videoMateriRepository } from "@/repositories/videoMateriRepository";
import { ApiError } from "@/lib/errors";
import { validateFile } from "@/utils/upload";
import type { UploadResult } from "@/types/upload";
import ImageKit from "imagekit";
import { Prisma } from "@prisma/client";
import { deleteImageKitFile, getFileIdFromUrl } from "@/utils/imagekit";

const imageKit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY!,
  privateKey: process.env.PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_URL_ENDPOINT!,
});

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

export const uploadVideo = async (file: File): Promise<UploadResult> => {
  try {
    const validationError = await validateFile(file, "video");
    if (validationError) {
      return {
        success: false,
        error: validationError,
      };
    }

    const buffer = await file.arrayBuffer();
    const response = await imageKit.upload({
      file: Buffer.from(buffer),
      fileName: file.name,
      folder: "/materi/videos",
    });

    return {
      success: true,
      url: response.url,
    };
  } catch (e) {
    console.error("Upload Video Error:", e);
    return {
      success: false,
      error: {
        code: "INVALID_FILE_TYPE",
        message: "Gagal mengupload video. Format file tidak didukung.",
      },
    };
  }
};

export const uploadThumbnail = async (file: File): Promise<UploadResult> => {
  try {
    const validationError = await validateFile(file, "image");
    if (validationError) {
      return {
        success: false,
        error: validationError,
      };
    }

    const buffer = await file.arrayBuffer();
    const response = await imageKit.upload({
      file: Buffer.from(buffer),
      fileName: file.name,
      folder: "/materi/thumbnails",
    });

    return {
      success: true,
      url: response.url,
    };
  } catch (e) {
    console.error("Upload Thumbnail Error:", e);
    return {
      success: false,
      error: {
        code: "INVALID_FILE_TYPE",
        message: "Gagal mengupload thumbnail. Format file tidak didukung.",
      },
    };
  }
};

export const createVideoMateri = async (
  input: Prisma.VideoMateriCreateInput,
  videoFile: File,
  thumbnailFile?: File
) => {
  try {
    const materiId = input.materiRef.connect?.id;
    if (!materiId) {
      throw new ApiError("VALIDATION_ERROR", "MateriId is required", 400);
    }

    const videoResult = await uploadVideo(videoFile);
    if (!videoResult.success || !videoResult.url) {
      throw new ApiError(
        "UPLOAD_FAILED",
        videoResult.error?.message || "Gagal mengupload video",
        500
      );
    }

    let thumbnailUrl: string | undefined;
    if (thumbnailFile) {
      const thumbnailResult = await uploadThumbnail(thumbnailFile);
      if (!thumbnailResult.success) {
        throw new ApiError(
          "UPLOAD_FAILED",
          thumbnailResult.error?.message || "Gagal mengupload thumbnail",
          500
        );
      }
      thumbnailUrl = thumbnailResult.url;
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
      videoUrl: videoResult.url,
      thumbnailUrl,
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
  data: Prisma.VideoMateriUpdateInput,
  videoFile?: File,
  thumbnailFile?: File
) => {
  try {
    // Get current data
    const currentVideo = await videoMateriRepository.findById(id);
    if (!currentVideo) {
      throw new ApiError("NOT_FOUND", "Video materi tidak ditemukan", 404);
    }

    const updateData: Prisma.VideoMateriUpdateInput = { ...data };

    // Handle video upload and deletion
    if (videoFile) {
      const videoResult = await uploadVideo(videoFile);
      if (!videoResult.success || !videoResult.url) {
        throw new ApiError(
          "UPLOAD_FAILED",
          videoResult.error?.message || "Gagal mengupload video",
          500
        );
      }
      
      // Delete old video if exists
      if (currentVideo.videoUrl) {
        const oldVideoFileId = getFileIdFromUrl(currentVideo.videoUrl);
        if (oldVideoFileId) {
          await deleteImageKitFile(oldVideoFileId);
        }
      }
      
      updateData.videoUrl = videoResult.url;
    }

    // Handle thumbnail upload and deletion
    if (thumbnailFile) {
      const thumbnailResult = await uploadThumbnail(thumbnailFile);
      if (!thumbnailResult.success || !thumbnailResult.url) {
        throw new ApiError(
          "UPLOAD_FAILED",
          thumbnailResult.error?.message || "Gagal mengupload thumbnail",
          500
        );
      }

      // Delete old thumbnail if exists
      if (currentVideo.thumbnailUrl) {
        const oldThumbnailFileId = getFileIdFromUrl(currentVideo.thumbnailUrl);
        if (oldThumbnailFileId) {
          await deleteImageKitFile(oldThumbnailFileId);
        }
      }

      updateData.thumbnailUrl = thumbnailResult.url;
    }

    return await videoMateriRepository.update(id, updateData);
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error("Update VideoMateri Error:", e);
    throw new ApiError("UPDATE_FAILED", "Gagal mengupdate video materi", 500);
  }
};

export const deleteVideoMateri = async (id: string) => {
  try {
    // Get video details first
    const videoMateri = await videoMateriRepository.findById(id);
    if (!videoMateri) {
      throw new ApiError("NOT_FOUND", "Video materi tidak ditemukan", 404);
    }

    // Delete media files from ImageKit
    if (videoMateri.videoUrl) {
      const videoFileId = getFileIdFromUrl(videoMateri.videoUrl);
      if (videoFileId) {
        await deleteImageKitFile(videoFileId);
      }
    }

    if (videoMateri.thumbnailUrl) {
      const thumbnailFileId = getFileIdFromUrl(videoMateri.thumbnailUrl);
      if (thumbnailFileId) {
        await deleteImageKitFile(thumbnailFileId);
      }
    }

    // Delete database record
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
