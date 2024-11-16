// src/services/materiService.ts

import { cache } from "react";
import type {
  MateriWithSubMateri,
  MateriFilters,
  MateriCreateInput,
  MateriUpdateInput,
  SubMateriCreateInput,
  SubMateriUpdateInput,
} from "@/types/materi";
import { materiSchema, subMateriSchema } from "@/types/materi";
import prisma from "@/lib/prisma";
import { ApiError } from "@/lib/errors";
import { revalidateTag } from "next/cache";
import { Prisma } from "@prisma/client";

const CACHE_TAGS = {
  MATERI_LIST: "materi-list",
  MATERI_DETAIL: "materi-detail",
  MATERI_STATS: "materi-stats",
} as const;

// Base query for including subMateri
const includeSubMateri = {
  subMateri: {
    orderBy: { urutan: "asc" as const },
  },
} as const;

export const getMateri = cache(async (filters: MateriFilters) => {
  try {
    const {
      search = "",
      page = 1,
      limit = 10,
      sortBy = "urutan",
      sortOrder = "asc",
      status,
    } = filters;

    const where: Prisma.MateriWhereInput = {
      AND: [
        search
          ? {
              OR: [
                {
                  judul: {
                    contains: search,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
                {
                  deskripsi: {
                    contains: search,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
              ],
            }
          : {},
        status !== undefined ? { status } : {},
      ],
    };

    const [materi, total] = await prisma.$transaction([
      prisma.materi.findMany({
        where,
        include: includeSubMateri,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.materi.count({ where }),
    ]);

    return { materi, total, page, limit };
  } catch (e) {
    const error = e as Error;
    console.error("Get Materi Error:", error);
    throw new ApiError("FETCH_FAILED", "Gagal mengambil data materi", 500);
  }
});

export const getMateriById = cache(
  async (id: string): Promise<MateriWithSubMateri> => {
    try {
      const materi = await prisma.materi.findUnique({
        where: { id },
        include: includeSubMateri,
      });

      if (!materi) {
        throw new ApiError("NOT_FOUND", "Materi tidak ditemukan", 404);
      }

      return materi;
    } catch (e) {
      if (e instanceof ApiError) throw e;
      const error = e as Error;
      console.error("Get Materi By ID Error:", error);
      throw new ApiError("FETCH_FAILED", "Gagal mengambil data materi", 500);
    }
  }
);

export const createMateri = async (
  data: MateriCreateInput,
  adminId: string
): Promise<MateriWithSubMateri> => {
  try {
    const validatedData = materiSchema.parse(data);

    const materi = await prisma.materi.create({
      data: {
        ...validatedData,
        createdBy: adminId,
        updatedBy: adminId,
      },
      include: includeSubMateri,
    });

    revalidateTag(CACHE_TAGS.MATERI_LIST);
    return materi;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    const error = e as Error;
    console.error("Create Materi Error:", error);
    throw new ApiError("CREATE_FAILED", "Gagal membuat materi baru", 500);
  }
};

export const addSubMateri = async (
  materiId: string,
  data: SubMateriCreateInput,
  adminId: string
): Promise<MateriWithSubMateri> => {
  try {
    const validatedData = subMateriSchema.parse(data);

    const materi = await prisma.materi.update({
      where: { id: materiId },
      data: {
        updatedBy: adminId,
        subMateri: {
          create: {
            ...validatedData,
            createdBy: adminId,
            updatedBy: adminId,
          },
        },
      },
      include: includeSubMateri,
    });

    revalidateTag(`${CACHE_TAGS.MATERI_DETAIL}-${materiId}`);
    return materi;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    const error = e as Error;
    console.error("Add SubMateri Error:", error);
    throw new ApiError("CREATE_FAILED", "Gagal menambah sub-materi", 500);
  }
};

export const updateMateri = async (
  id: string,
  data: MateriUpdateInput,
  adminId: string
): Promise<MateriWithSubMateri> => {
  try {
    const validatedData = materiSchema.partial().parse(data);

    const materi = await prisma.materi.update({
      where: { id },
      data: {
        ...validatedData,
        updatedBy: adminId,
      },
      include: includeSubMateri,
    });

    revalidateTag(`${CACHE_TAGS.MATERI_DETAIL}-${id}`);
    revalidateTag(CACHE_TAGS.MATERI_LIST);
    return materi;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    const error = e as Error;
    console.error("Update Materi Error:", error);
    throw new ApiError("UPDATE_FAILED", "Gagal mengupdate materi", 500);
  }
};

export const updateSubMateri = async (
  materiId: string,
  subMateriId: string,
  data: SubMateriUpdateInput,
  adminId: string
): Promise<MateriWithSubMateri> => {
  try {
    const validatedData = subMateriSchema.partial().parse(data);

    const materi = await prisma.materi.update({
      where: { id: materiId },
      data: {
        updatedBy: adminId,
        subMateri: {
          update: {
            where: { id: subMateriId },
            data: {
              ...validatedData,
              updatedBy: adminId,
            },
          },
        },
      },
      include: includeSubMateri,
    });

    revalidateTag(`${CACHE_TAGS.MATERI_DETAIL}-${materiId}`);
    return materi;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    const error = e as Error;
    console.error("Update SubMateri Error:", error);
    throw new ApiError("UPDATE_FAILED", "Gagal mengupdate sub-materi", 500);
  }
};

export const deleteMateri = async (id: string): Promise<void> => {
  try {
    await prisma.materi.delete({
      where: { id },
    });

    revalidateTag(CACHE_TAGS.MATERI_LIST);
    revalidateTag(`${CACHE_TAGS.MATERI_DETAIL}-${id}`);
  } catch (e) {
    if (e instanceof ApiError) throw e;
    const error = e as Error;
    console.error("Delete Materi Error:", error);
    throw new ApiError("DELETE_FAILED", "Gagal menghapus materi", 500);
  }
};

export const deleteSubMateri = async (
  materiId: string,
  subMateriId: string,
  adminId: string
): Promise<MateriWithSubMateri> => {
  try {
    const materi = await prisma.materi.update({
      where: { id: materiId },
      data: {
        updatedBy: adminId,
        subMateri: {
          delete: { id: subMateriId },
        },
      },
      include: includeSubMateri,
    });

    revalidateTag(`${CACHE_TAGS.MATERI_DETAIL}-${materiId}`);
    return materi;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    const error = e as Error;
    console.error("Delete SubMateri Error:", error);
    throw new ApiError("DELETE_FAILED", "Gagal menghapus sub-materi", 500);
  }
};

export const getMateriStats = cache(async () => {
  try {
    const [total, active, inactive] = await Promise.all([
      prisma.materi.count(),
      prisma.materi.count({ where: { status: true } }),
      prisma.materi.count({ where: { status: false } }),
    ]);

    return {
      total,
      active,
      inactive,
    };
  } catch (e) {
    const error = e as Error;
    console.error("Get Materi Stats Error:", error);
    // Throw error yang lebih spesifik
    throw new ApiError(
      "FETCH_FAILED",
      "Gagal mengambil statistik materi - " + error.message,
      500
    );
  }
});
