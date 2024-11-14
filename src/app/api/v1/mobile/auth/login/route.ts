// src/app/api/v1/auth/mobile/login/route.ts

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { userRepository } from "@/repositories/userRepository";
import { refreshTokenRepository } from "@/repositories/refreshTokenRepository";
import { signJWT } from "@/lib/auth";
import { ApiError } from "@/lib/errors";
import { AUTH_CONFIG } from "@/config/auth";
import { rateLimit } from "@/lib/rate-limit";
import type { UserAuthResponse } from "@/types/auth";

// Rate limiter untuk login attempts
const limiter = rateLimit({
  interval: AUTH_CONFIG.rateLimit.loginWindowMs,
  uniqueTokenPerInterval: AUTH_CONFIG.rateLimit.loginMax
});

export async function POST(request: NextRequest): Promise<NextResponse<UserAuthResponse>> {
  try {
    // Check rate limit
    await limiter.check(request, AUTH_CONFIG.rateLimit.loginMax);

    // Validate device ID
    const deviceId = request.headers.get(AUTH_CONFIG.mobile.deviceIdHeader);
    if (!deviceId && AUTH_CONFIG.mobile.requiredForMobile) {
      throw new ApiError("BAD_REQUEST", "Device ID is required", 400);
    }

    // Get credentials from request body
    const { username, password } = await request.json();

    if (!username || !password) {
      throw new ApiError("BAD_REQUEST", "Username and password are required", 400);
    }

    // Find user by username
    const user = await userRepository.findByUsername(username);
    if (!user) {
      throw new ApiError("UNAUTHORIZED", "Invalid credentials", 401);
    }

    // Check if user is active
    if (!user.activeStatus) {
      throw new ApiError("UNAUTHORIZED", "Account is inactive", 401);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new ApiError("UNAUTHORIZED", "Invalid credentials", 401);
    }

    // Check device limit if device ID is provided
    if (deviceId) {
      const devices = await refreshTokenRepository.findByUserId(user.id);
      if (devices.length >= AUTH_CONFIG.session.maxDevices) {
        throw new ApiError("FORBIDDEN", "Maximum devices reached", 403);
      }
    }

    // Generate tokens
    const accessToken = await signJWT({
      sub: user.id,
      username: user.username,
      email: user.email,
      role: "user"
    });

    // Create refresh token with device info
    const refreshToken = await refreshTokenRepository.create({
      userId: user.id,
      deviceId: deviceId || "unknown",
      deviceInfo: request.headers.get("user-agent") || undefined,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    // Update last login
    await userRepository.update(user.id, {
      lastLogin: new Date(),
      deviceId: deviceId || undefined
    });

    // Return response
    return NextResponse.json({
      success: true,
      message: "Login successful",
      data: {
        accessToken,
        refreshToken: refreshToken.token,
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          gender: user.gender,
          activeStatus: user.activeStatus
        }
      }
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
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}