// src/services/adminUserService.ts

import { cache } from "react";
import type {
  UserCreate,
  UserUpdate,
  UserResponse,
  UserFilters,
} from "@/types/user";
import { userRepository } from "@/repositories/userRepository";
import bcrypt from "bcrypt";
import { ApiError } from "@/lib/errors";
import { VALIDATION_PATTERNS } from "@/config/auth";

const SALT_ROUNDS = 10;

export const getUsers = cache(async (filters: UserFilters) => {
  try {
    const result = await userRepository.findMany(filters);
    return {
      users: result.users,
      total: result.total,
      page: filters.page || 1,
      limit: filters.limit || 10,
    };
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error("Get Users Error:", e);
    throw new ApiError("FETCH_FAILED", "Gagal mengambil data user", 500);
  }
});

export const getUserById = cache(async (id: string): Promise<UserResponse> => {
  try {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new ApiError("NOT_FOUND", "User tidak ditemukan", 404);
    }
    return user;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error("Get User By ID Error:", e);
    throw new ApiError("FETCH_FAILED", "Gagal mengambil data user", 500);
  }
});

export const createUser = async (data: UserCreate): Promise<UserResponse> => {
  try {
    // Validate password against policy
    if (!data.password || !data.password.match(VALIDATION_PATTERNS.password)) {
      throw new ApiError("VALIDATION_ERROR", "Password tidak memenuhi ketentuan", 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    // Create user
    const user = await userRepository.create({
      ...data,
      password: hashedPassword,
    });

    return user;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error("Create User Error:", e);
    throw new ApiError("CREATE_FAILED", "Gagal membuat user baru", 500);
  }
};

export const updateUser = async (
  id: string,
  data: UserUpdate
): Promise<UserResponse> => {
  try {
    // If password is being updated, validate and hash it
    if (data.password) {
      if (!data.password.match(VALIDATION_PATTERNS.password)) {
        throw new ApiError("VALIDATION_ERROR", "Password tidak memenuhi ketentuan", 400);
      }
      data.password = await bcrypt.hash(data.password, SALT_ROUNDS);
    }

    // Update user
    const user = await userRepository.update(id, data);
    return user;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error("Update User Error:", e);
    throw new ApiError("UPDATE_FAILED", "Gagal mengupdate user", 500);
  }
};

export const deleteUser = async (id: string): Promise<void> => {
  try {
    await userRepository.delete(id);
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error("Delete User Error:", e);
    throw new ApiError("DELETE_FAILED", "Gagal menghapus user", 500);
  }
};

export const toggleUserStatus = async (id: string, active: boolean): Promise<UserResponse> => {
  try {
    const user = await userRepository.update(id, { activeStatus: active });
    return user;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error("Toggle User Status Error:", e);
    throw new ApiError("UPDATE_FAILED", "Gagal mengubah status user", 500);
  }
};

export const getUserStats = cache(async () => {
  try {
    const [totalUsers, activeUsers, inactiveUsers] = await Promise.all([
      userRepository.count(),
      userRepository.count({ activeStatus: true }),
      userRepository.count({ activeStatus: false }),
    ]);

    return {
      total: totalUsers,
      active: activeUsers,
      inactive: inactiveUsers,
    };
  } catch (e) {
    console.error("Get User Stats Error:", e);
    throw new ApiError("FETCH_FAILED", "Gagal mengambil statistik user", 500);
  }
});