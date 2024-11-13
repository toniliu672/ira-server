// src/app/api/v1/mobile/users/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createUser, getUserById } from "@/services/adminUserService";
import { userSchema } from "@/types/user";
import { ApiError } from "@/lib/errors";
import { verifyJWT } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 1000,
});

// POST /api/v1/mobile/users - Register new user
export async function POST(req: NextRequest) {
  try {
    await limiter.check(req, 10); // Strict limit for registration
    
    const deviceId = req.headers.get("x-device-id");
    if (!deviceId) {
      return NextResponse.json(
        { 
          success: false,
          message: "Device ID is required",
          error: "MISSING_DEVICE_ID" 
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    
    // Validasi input
    const validatedData = userSchema.parse({
      ...body,
      deviceId,
      activeStatus: true, // User baru selalu aktif
    });
    
    const user = await createUser(validatedData);
    
    return NextResponse.json({
      success: true,
      message: "Successfully registered user",
      data: user
    }, { status: 201 });
  } catch (e) {
    console.error("Mobile User Registration Error:", e);
    if (e instanceof ApiError) {
      return NextResponse.json(
        { 
          success: false,
          message: e.message,
          error: e.code 
        }, 
        { status: e.status }
      );
    }
    return NextResponse.json(
      { 
        success: false,
        message: "Internal server error",
        error: "INTERNAL_ERROR" 
      },
      { status: 500 }
    );
  }
}

// GET /api/v1/mobile/users/me - Get own user profile
export async function GET(req: NextRequest) {
  try {
    await limiter.check(req, 60);

    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { 
          success: false,
          message: "Unauthorized access",
          error: "No token provided" 
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
          error: "INVALID_TOKEN_TYPE" 
        },
        { status: 403 }
      );
    }

    const user = await getUserById(payload.sub);
    
    return NextResponse.json({
      success: true,
      message: "Successfully retrieved profile",
      data: user
    });
  } catch (e) {
    console.error("Mobile Get User Profile Error:", e);
    if (e instanceof ApiError) {
      return NextResponse.json(
        { 
          success: false,
          message: e.message,
          error: e.code 
        }, 
        { status: e.status }
      );
    }
    return NextResponse.json(
      { 
        success: false,
        message: "Internal server error",
        error: "INTERNAL_ERROR" 
      },
      { status: 500 }
    );
  }
}