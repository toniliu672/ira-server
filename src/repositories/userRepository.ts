// src/repositories/userRepository.ts

import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { ApiError } from "@/lib/errors";
import type { UserFilters } from "@/types/user";

interface CountOptions {
  activeStatus?: boolean;
}

export class UserRepository {
  async findById(id: string) {
    try {
      return await prisma.student.findUnique({
        where: { id },
        select: {
          id: true,
          username: true,
          email: true,
          password: true,
          fullName: true,
          gender: true,
          phone: true,
          address: true,
          activeStatus: true,
          deviceId: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (e) {
      const error = e as Error;
      console.error("Repository Find User By ID Error:", error.message);
      throw new ApiError("FETCH_FAILED", "Gagal mengambil data user", 500);
    }
  }

  async findMany(filters: UserFilters) {
    const {
      search = "",
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      activeOnly = false,
    } = filters;

    try {
      const where: Prisma.StudentWhereInput = {
        AND: [
          search
            ? {
                OR: [
                  { username: { contains: search, mode: "insensitive" } },
                  { fullName: { contains: search, mode: "insensitive" } },
                  { email: { contains: search, mode: "insensitive" } },
                ],
              }
            : {},
          activeOnly ? { activeStatus: true } : {},
        ],
      };

      const [users, total] = await prisma.$transaction([
        prisma.student.findMany({
          where,
          select: {
            id: true,
            username: true,
            email: true,
            fullName: true,
            gender: true,
            phone: true,
            address: true,
            activeStatus: true,
            lastLogin: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { [sortBy]: sortOrder },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.student.count({ where }),
      ]);

      return { users, total };
    } catch (e) {
      const error = e as Error;
      console.error("Repository Find Many Users Error:", error.message);
      throw new ApiError("FETCH_FAILED", "Gagal mengambil data user", 500);
    }
  }

  async findByUsername(username: string) {
    try {
      return await prisma.student.findUnique({
        where: { username },
        select: {
          id: true,
          username: true,
          email: true,
          password: true,
          fullName: true,
          gender: true,
          phone: true,
          address: true,
          activeStatus: true,
          deviceId: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (e) {
      const error = e as Error;
      console.error("Repository Find User By Username Error:", error.message);
      throw new ApiError("FETCH_FAILED", "Gagal mengambil data user", 500);
    }
  }

  async create(data: Prisma.StudentCreateInput) {
    try {
      return await prisma.student.create({
        data,
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          gender: true,
          phone: true,
          address: true,
          activeStatus: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (e) {
      const error = e as Error;
      console.error("Repository Create User Error:", error.message);

      if (error.message.includes("Unique constraint")) {
        throw new ApiError(
          "DUPLICATE_ENTRY",
          "Username atau email sudah digunakan",
          409
        );
      }

      throw new ApiError("CREATE_FAILED", "Gagal membuat user baru", 500);
    }
  }

  async update(id: string, data: Prisma.StudentUpdateInput) {
    try {
      return await prisma.student.update({
        where: { id },
        data,
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          gender: true,
          phone: true,
          address: true,
          activeStatus: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (e) {
      const error = e as Error;
      console.error("Repository Update User Error:", error.message);

      if (error.message.includes("Record to update not found")) {
        throw new ApiError("NOT_FOUND", "User tidak ditemukan", 404);
      }

      if (error.message.includes("Unique constraint")) {
        throw new ApiError(
          "DUPLICATE_ENTRY",
          "Username atau email sudah digunakan",
          409
        );
      }

      throw new ApiError("UPDATE_FAILED", "Gagal mengupdate user", 500);
    }
  }

  async delete(id: string) {
    try {
      await prisma.student.delete({
        where: { id },
      });
    } catch (e) {
      const error = e as Error;
      console.error("Repository Delete User Error:", error.message);

      if (error.message.includes("Record to delete does not exist")) {
        throw new ApiError("NOT_FOUND", "User tidak ditemukan", 404);
      }

      throw new ApiError("DELETE_FAILED", "Gagal menghapus user", 500);
    }
  }

  async count(options: CountOptions = {}) {
    try {
      return await prisma.student.count({
        where: {
          activeStatus: options.activeStatus,
        },
      });
    } catch (e) {
      const error = e as Error;
      console.error("Repository Count Users Error:", error.message);
      throw new ApiError("FETCH_FAILED", "Gagal menghitung jumlah user", 500);
    }
  }
}


export const userRepository = new UserRepository();
