// src/app/api/v1/mobile/users/me/password/route.ts

import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "@/lib/errors";
import { verifyJWT } from "@/lib/auth";
import { updatePassword } from "@/services/mobileUserService";
import { userUpdateSchema } from "@/types/user";

export async function PUT(req: NextRequest) {
  try {
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
