// src/app/api/v1/mobile/auth/login/route.ts

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { userRepository } from "@/repositories/userRepository";
import { signJWT } from "@/lib/auth";
import { ApiError } from "@/lib/errors";
import type { UserAuthResponse } from "@/types/auth";

export async function POST(
  request: NextRequest
): Promise<NextResponse<UserAuthResponse>> {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      throw new ApiError(
        "BAD_REQUEST",
        "Username dan password harus diisi",
        400
      );
    }

    const user = await userRepository.findByUsername(username);
    if (!user) {
      throw new ApiError("UNAUTHORIZED", "Username atau password salah", 401);
    }

    if (!user.activeStatus) {
      throw new ApiError("UNAUTHORIZED", "Akun tidak aktif", 401);
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new ApiError("UNAUTHORIZED", "Username atau password salah", 401);
    }

    const accessToken = await signJWT({
      sub: user.id,
      username: user.username,
      email: user.email,
      role: "user",
    });

    await userRepository.update(user.id, {
      lastLogin: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Login berhasil",
      data: {
        accessToken,
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          gender: user.gender,
          activeStatus: user.activeStatus,
        },
      },
    });
  } catch (e) {
    if (e instanceof ApiError) {
      return NextResponse.json(
        { success: false, message: e.message },
        { status: e.status }
      );
    }

    console.error("Mobile Login Error:", (e as Error).message);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
