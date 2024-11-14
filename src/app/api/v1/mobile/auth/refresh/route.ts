// src/app/api/v1/mobile/auth/refresh/route.ts

import { NextRequest, NextResponse } from "next/server";
import { refreshTokenRepository } from "@/repositories/refreshTokenRepository";
import { userRepository } from "@/repositories/userRepository";
import { signJWT } from "@/lib/auth";
import { ApiError } from "@/lib/errors";
import { AUTH_CONFIG } from "@/config/auth";
import { rateLimit } from "@/lib/rate-limit";
import type { UserAuthResponse } from "@/types/auth";

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 100,
});

export async function POST(
  request: NextRequest
): Promise<NextResponse<UserAuthResponse>> {
  try {
    // Check rate limit
    await limiter.check(request, 20);

    // Get refresh token from request body
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      throw new ApiError("BAD_REQUEST", "Refresh token is required", 400);
    }

    // Validate device ID if required
    const deviceId = request.headers.get(AUTH_CONFIG.mobile.deviceIdHeader);
    if (!deviceId && AUTH_CONFIG.mobile.requiredForMobile) {
      throw new ApiError("BAD_REQUEST", "Device ID is required", 400);
    }

    // Find refresh token
    const token = await refreshTokenRepository.findByToken(refreshToken);
    if (!token) {
      throw new ApiError("UNAUTHORIZED", "Invalid refresh token", 401);
    }

    // Check if token is expired or revoked
    if (token.expires < new Date() || token.revokedAt) {
      throw new ApiError(
        "UNAUTHORIZED",
        "Refresh token expired or revoked",
        401
      );
    }

    // Validate device ID matches if provided
    if (deviceId && token.deviceId !== deviceId) {
      throw new ApiError("UNAUTHORIZED", "Invalid device", 401);
    }

    // Get user
    const user = await userRepository.findById(token.studentId);
    if (!user) {
      throw new ApiError("UNAUTHORIZED", "User not found", 401);
    }

    // Check if user is still active
    if (!user.activeStatus) {
      throw new ApiError("UNAUTHORIZED", "Account is inactive", 401);
    }

    // Generate new access token
    const accessToken = await signJWT({
      sub: user.id,
      username: user.username,
      email: user.email,
      role: "user",
    });

    // Create new refresh token
    await refreshTokenRepository.revokeToken(token.id);

    // Ensure deviceId is valid string
    const validDeviceId = token.deviceId || "unknown";
    const deviceInfo = token.deviceId || undefined;

    const newRefreshToken = await refreshTokenRepository.create({
      userId: user.id,
      deviceId: validDeviceId,
      deviceInfo,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    // Return new tokens
    return NextResponse.json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken,
        refreshToken: newRefreshToken.token,
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

    console.error("Mobile Refresh Token Error:", (e as Error).message);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
