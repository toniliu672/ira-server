// src/app/api/v1/mobile/users/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createUser } from "@/services/adminUserService";
import { userSchema } from "@/types/user";
import { ApiError } from "@/lib/errors";
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
      activeStatus: true, 
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
