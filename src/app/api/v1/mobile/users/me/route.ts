// src/app/api/v1/mobile/users/me/route.ts

import { NextRequest, NextResponse } from "next/server";
import { updateUser } from "@/services/adminUserService";
import { userUpdateSchema } from "@/types/user";
import { ApiError } from "@/lib/errors";
import { verifyJWT } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/v1/mobile/users/me - Get own profile
export async function GET(req: NextRequest) {
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

    const user = await prisma.student.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        gender: true,
        phone: true,
        address: true,
        activeStatus: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Successfully retrieved profile",
      data: user,
    });
  } catch (e) {
    console.error("Mobile Get Profile Error:", e);
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

export async function PATCH(req: NextRequest) {
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

    // Hanya batasi fields yang tidak boleh diubah user
    delete body.role;
    delete body.activeStatus;

    // Cek duplikat username/email kalau mau diganti
    if (body.username || body.email) {
      const duplicate = await prisma.student.findFirst({
        where: {
          OR: [
            body.username ? { username: body.username } : {},
            body.email ? { email: body.email } : {},
          ],
          NOT: { id: payload.sub },
        },
      });

      if (duplicate) {
        const field =
          duplicate.username === body.username ? "Username" : "Email";
        return NextResponse.json(
          {
            success: false,
            message: `${field} sudah digunakan`,
            error: "DUPLICATE_ENTRY",
          },
          { status: 409 }
        );
      }
    }

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
