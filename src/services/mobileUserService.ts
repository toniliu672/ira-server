// src/services/mobileUserService.ts

import type { UserUpdate, UserResponse } from "@/types/user";
import { userRepository } from "@/repositories/userRepository";
import bcrypt from "bcrypt";
import { ApiError } from "@/lib/errors";

const SALT_ROUNDS = 10;

export const getProfile = async (id: string): Promise<UserResponse> => {
  try {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new ApiError("NOT_FOUND", "User tidak ditemukan", 404);
    }
    return user;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error("Get Profile Error:", e);
    throw new ApiError("FETCH_FAILED", "Gagal mengambil profil", 500);
  }
};

export const updateProfile = async (
  id: string,
  data: UserUpdate
): Promise<UserResponse> => {
  try {
    // Remove restricted fields
    const allowedUpdates = {
      fullName: data.fullName,
      phone: data.phone,
      address: data.address,
    };

    const user = await userRepository.update(id, allowedUpdates);
    return user;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error("Update Profile Error:", e);
    throw new ApiError("UPDATE_FAILED", "Gagal mengupdate profil", 500);
  }
};

export const updatePassword = async (
  id: string,
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  try {
    // Get user with current password
    const user = await userRepository.findById(id);
    if (!user) {
      throw new ApiError("NOT_FOUND", "User tidak ditemukan", 404);
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw new ApiError(
        "INVALID_PASSWORD",
        "Password saat ini tidak valid",
        400
      );
    }

    // Hash and update password
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await userRepository.update(id, { password: hashedPassword });
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error("Update Password Error:", e);
    throw new ApiError("UPDATE_FAILED", "Gagal mengupdate password", 500);
  }
};