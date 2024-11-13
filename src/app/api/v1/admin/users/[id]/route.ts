// src/app/api/v1/admin/users/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getUserById, updateUser, deleteUser } from "@/services/adminUserService";
import { userUpdateSchema } from "@/types/user";
import { ApiError } from "@/lib/errors";
import { verifyJWT } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});

// GET /api/v1/admin/users/[id] - Get user detail
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    if (payload.role !== "admin") {
      return NextResponse.json(
        { 
          success: false,
          message: "Forbidden access",
          error: "Admin privileges required" 
        },
        { status: 403 }
      );
    }

    const user = await getUserById(params.id);
    
    return NextResponse.json({
      success: true,
      message: "Successfully retrieved user details",
      data: user
    });
  } catch (e) {
    console.error("Admin Get User Detail Error:", e);
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

// PATCH /api/v1/admin/users/[id] - Update user
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await limiter.check(req, 30);

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
    if (payload.role !== "admin") {
      return NextResponse.json(
        { 
          success: false,
          message: "Forbidden access",
          error: "Admin privileges required" 
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    
    // Validasi input
    const validatedData = userUpdateSchema.parse(body);
    
    const user = await updateUser(params.id, validatedData);
    
    return NextResponse.json({
      success: true,
      message: "Successfully updated user",
      data: user
    });
  } catch (e) {
    console.error("Admin Update User Error:", e);
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

// DELETE /api/v1/admin/users/[id] - Delete user
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await limiter.check(req, 20);

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
    if (payload.role !== "admin") {
      return NextResponse.json(
        { 
          success: false,
          message: "Forbidden access",
          error: "Admin privileges required" 
        },
        { status: 403 }
      );
    }

    await deleteUser(params.id);
    
    return NextResponse.json({
      success: true,
      message: "Successfully deleted user"
    }, { status: 200 });
  } catch (e) {
    console.error("Admin Delete User Error:", e);
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