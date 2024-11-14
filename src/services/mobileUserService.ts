// src/services/mobileUserService.ts

import type {
  UserCreate,
  UserUpdate,
  UserResponse,
  UserDevice,
} from "@/types/user";
import { userRepository } from "@/repositories/userRepository";
import { refreshTokenRepository } from "@/repositories/refreshTokenRepository";
import bcrypt from "bcrypt";
import { ApiError } from "@/lib/errors";
import { VALIDATION_PATTERNS } from "@/config/auth";

const SALT_ROUNDS = 10;
const MAX_DEVICES = 5;

export const registerUser = async (
  data: UserCreate,
  deviceId: string
): Promise<UserResponse> => {
  try {
    // Validasi password sederhana
    if (!data.password || data.password.length < 8) {
      throw new ApiError(
        "VALIDATION_ERROR",
        "Password minimal 8 karakter",
        400
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    // Create user with device ID
    const user = await userRepository.create({
      ...data,
      password: hashedPassword,
      deviceId,
      activeStatus: true,
    });

    return user;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error("Register User Error:", e);
    throw new ApiError("REGISTRATION_FAILED", "Gagal mendaftarkan user", 500);
  }
};

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

    // Validate new password
    if (!newPassword.match(VALIDATION_PATTERNS.password)) {
      throw new ApiError(
        "VALIDATION_ERROR",
        "Format password baru tidak valid",
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

export const getUserDevices = async (userId: string): Promise<UserDevice[]> => {
  try {
    const tokens = await refreshTokenRepository.findByUserId(userId);

    return tokens.map((token) => ({
      id: token.id,
      deviceId: token.deviceId || "unknown",
      lastLogin: token.createdAt,
      deviceInfo: token.deviceId || undefined,
    }));
  } catch (e) {
    console.error("Get Devices Error:", e);
    throw new ApiError("FETCH_FAILED", "Gagal mengambil data perangkat", 500);
  }
};

export const addDevice = async (
  userId: string,
  deviceId: string,
  deviceInfo?: string
): Promise<void> => {
  try {
    // Check device limit
    const devices = await getUserDevices(userId);
    if (devices.length >= MAX_DEVICES) {
      throw new ApiError(
        "DEVICE_LIMIT",
        "Jumlah maksimal perangkat tercapai",
        400
      );
    }

    // Check if device already exists
    const existingDevice = devices.find((d) => d.deviceId === deviceId);
    if (existingDevice) {
      throw new ApiError("DUPLICATE_DEVICE", "Perangkat sudah terdaftar", 400);
    }

    // Update user's device ID
    await userRepository.update(userId, { deviceId });

    // Create refresh token with device info
    await refreshTokenRepository.create({
      userId,
      deviceId,
      deviceInfo,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error("Add Device Error:", e);
    throw new ApiError("DEVICE_ADD_FAILED", "Gagal menambahkan perangkat", 500);
  }
};

export const removeDevice = async (
  userId: string,
  deviceId: string
): Promise<void> => {
  try {
    await refreshTokenRepository.revokeByDeviceId(userId, deviceId);
  } catch (e) {
    console.error("Remove Device Error:", e);
    throw new ApiError(
      "DEVICE_REMOVE_FAILED",
      "Gagal menghapus perangkat",
      500
    );
  }
};