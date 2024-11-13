// src/services/adminService.ts

import { cache } from "react";
import type {
  AdminCreate,
  AdminUpdate,
  AdminResponse,
  AdminFilters,
} from "@/types/admin";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { ApiError } from "@/lib/errors";
import type { Prisma } from "@prisma/client";

const SALT_ROUNDS = 10;

export const getAdmins = cache(async (filters: AdminFilters) => {
  const {
    search = "",
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = filters;

  const skip = (page - 1) * limit;

  try {
    const where: Prisma.AdminWhereInput = search
      ? {
          OR: [
            { username: { contains: search, mode: "insensitive" } },
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const [admins, total] = await prisma.$transaction([
      prisma.admin.findMany({
        where,
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.admin.count({ where }),
    ]);

    return {
      admins,
      total,
      page,
      limit,
    };
  } catch (e) {
    console.error("Get Admins Error:", e);
    throw new ApiError("FETCH_FAILED", "Gagal mengambil data admin", 500);
  }
});

export const getAdminById = cache(
  async (id: string): Promise<AdminResponse> => {
    try {
      const admin = await prisma.admin.findUnique({
        where: { id },
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!admin) {
        throw new ApiError("NOT_FOUND", "Admin tidak ditemukan", 404);
      }

      return admin;
    } catch (e) {
      if (e instanceof ApiError) throw e;
      console.error("Get Admin By ID Error:", e);
      throw new ApiError("FETCH_FAILED", "Gagal mengambil data admin", 500);
    }
  }
);

export const createAdmin = async (
  data: AdminCreate
): Promise<AdminResponse> => {
  try {
    // Check existing username/email
    const existing = await prisma.admin.findFirst({
      where: {
        OR: [{ username: data.username }, { email: data.email }],
      },
    });

    if (existing) {
      throw new ApiError(
        "DUPLICATE_ENTRY",
        "Username atau email sudah digunakan",
        409
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password!, SALT_ROUNDS);

    // Create admin
    const admin = await prisma.admin.create({
      data: {
        ...data,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return admin;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error("Create Admin Error:", e);
    throw new ApiError("CREATE_FAILED", "Gagal membuat admin baru", 500);
  }
};

export const updateAdmin = async (
  id: string,
  data: AdminUpdate
): Promise<AdminResponse> => {
  try {
    // Check admin exists
    const admin = await prisma.admin.findUnique({
      where: { id },
    });

    if (!admin) {
      throw new ApiError("NOT_FOUND", "Admin tidak ditemukan", 404);
    }

    // Check username/email not taken
    if (data.username || data.email) {
      const where: Prisma.AdminWhereInput = {
        OR: [],
        NOT: { id },
      };

      if (data.username) {
        where.OR?.push({ username: data.username });
      }
      if (data.email) {
        where.OR?.push({ email: data.email });
      }

      const duplicate = await prisma.admin.findFirst({ where });

      if (duplicate) {
        throw new ApiError(
          "DUPLICATE_ENTRY",
          "Username atau email sudah digunakan",
          409
        );
      }
    }

    // Hash password if provided
    const updateData = data.password
      ? {
          ...data,
          password: await bcrypt.hash(data.password, SALT_ROUNDS),
        }
      : data;

    // Update admin
    const updated = await prisma.admin.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updated;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error("Update Admin Error:", e);
    throw new ApiError("UPDATE_FAILED", "Gagal mengupdate admin", 500);
  }
};

export const deleteAdmin = async (id: string): Promise<void> => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id },
    });

    if (!admin) {
      throw new ApiError("NOT_FOUND", "Admin tidak ditemukan", 404);
    }

    await prisma.admin.delete({
      where: { id },
    });
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error("Delete Admin Error:", e);
    throw new ApiError("DELETE_FAILED", "Gagal menghapus admin", 500);
  }
};
