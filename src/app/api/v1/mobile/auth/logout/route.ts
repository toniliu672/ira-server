// src/app/api/v1/mobile/auth/logout/route.ts

import { NextRequest, NextResponse } from "next/server";
import { refreshTokenRepository } from "@/repositories/refreshTokenRepository";
import { verifyJWT } from "@/lib/auth";
import { ApiError } from "@/lib/errors";
import { rateLimit } from "@/lib/rate-limit";

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 100
});

export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    await limiter.check(request, 20);

    // Get access token from Authorization header
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      throw new ApiError("UNAUTHORIZED", "Access token is required", 401);
    }

    // Verify token
    const payload = await verifyJWT(token);
    if (payload.role !== "user") {
      throw new ApiError("UNAUTHORIZED", "Invalid token type", 401);
    }

    // Get device ID from header
    const deviceId = request.headers.get("x-device-id");

    // Revoke all refresh tokens for this device
    if (deviceId) {
      await refreshTokenRepository.revokeByDeviceId(payload.sub, deviceId);
    }

    return NextResponse.json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (e) {
    if (e instanceof ApiError) {
      return NextResponse.json(
        { success: false, message: e.message },
        { status: e.status }
      );
    }

    console.error("Mobile Logout Error:", (e as Error).message);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}