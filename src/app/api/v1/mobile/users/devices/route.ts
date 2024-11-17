// src/app/api/v1/mobile/users/me/devices/route.ts

import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "@/lib/errors";
import { verifyJWT } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { getUserDevices } from "@/services/mobileUserService";

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});

export async function GET(req: NextRequest) {
    try {
      await limiter.check(req, 30);
  
      const token = req.headers.get("authorization")?.split(" ")[1];
      if (!token) {
        return NextResponse.json(
          {
            success: false,
            message: "Unauthorized access",
            error: "No token provided",
          },
          { status: 401 }
        );
      }
  
      const payload = await verifyJWT(token);
      if (payload.role !== "user") {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid token type",
            error: "INVALID_TOKEN_TYPE",
          },
          { status: 403 }
        );
      }
  
      // Get user's devices (fungsi ini perlu dibuat di userService)
      const devices = await getUserDevices(payload.sub);
  
      return NextResponse.json({
        success: true,
        message: "Successfully retrieved devices",
        data: devices,
      });
    } catch (e) {
      console.error("Mobile Get Devices Error:", e);
      if (e instanceof ApiError) {
        return NextResponse.json(
          {
            success: false,
            message: e.message,
            error: e.code,
          },
          { status: e.status }
        );
      }
      return NextResponse.json(
        {
          success: false,
          message: "Internal server error",
          error: "INTERNAL_ERROR",
        },
        { status: 500 }
      );
    }
  }
  
