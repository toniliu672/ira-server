// src/app/api/v1/mobile/users/me/route.ts

import { NextRequest, NextResponse } from "next/server";
import { updateUser } from "@/services/adminUserService";
import { userUpdateSchema } from "@/types/user";
import { ApiError } from "@/lib/errors";
import { verifyJWT } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { getUserDevices, updatePassword } from "@/services/mobileUserService";

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});

// PATCH /api/v1/mobile/users/me - Update own profile
export async function PATCH(req: NextRequest) {
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
      // src/app/api/v1/mobile/users/me/route.ts (continued)

      return NextResponse.json(
        {
          success: false,
          message: "Invalid token type",
          error: "INVALID_TOKEN_TYPE",
        },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Mencegah perubahan fields yang tidak diizinkan
    delete body.username; // Username tidak boleh diubah
    delete body.email; // Email tidak boleh diubah
    delete body.activeStatus; // Status aktif tidak boleh diubah via mobile
    delete body.role; // Role tidak boleh diubah
    delete body.deviceId; // Device ID tidak boleh diubah via update profile

    // Validasi input yang diperbolehkan
    const validatedData = userUpdateSchema.parse(body);

    const user = await updateUser(payload.sub, validatedData);

    return NextResponse.json({
      success: true,
      message: "Successfully updated profile",
      data: user,
    });
  } catch (e) {
    console.error("Mobile Update Profile Error:", e);
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

// PUT /api/v1/mobile/users/me/password - Update own password
export async function PUT(req: NextRequest) {
  try {
    await limiter.check(req, 10); // Strict limit for password changes

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

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Current password and new password are required",
          error: "MISSING_REQUIRED_FIELDS",
        },
        { status: 400 }
      );
    }

    // Validasi format password baru
    const validatedData = userUpdateSchema.parse({ password: newPassword });

    // Update password (fungsi ini perlu dibuat di userService)
    await updatePassword(payload.sub, currentPassword, validatedData.password!);

    return NextResponse.json({
      success: true,
      message: "Successfully updated password",
    });
  } catch (e) {
    console.error("Mobile Update Password Error:", e);
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
