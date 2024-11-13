// src/app/api/v1/auth/admin/account/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { getAdminById, updateAdmin, deleteAdmin } from "@/services/adminService";
import { verifyJWT } from "@/lib/auth";
import { ApiError, ErrorCode } from "@/lib/errors";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin-token")?.value;
    
    if (!token) {
      throw new ApiError(ErrorCode.UNAUTHORIZED, 'Unauthorized', 401);
    }

    const payload = await verifyJWT(token);
    if (payload.role !== "admin") {
      throw new ApiError(ErrorCode.FORBIDDEN, 'Forbidden', 403);
    }

    const admin = await getAdminById(params.id);

    return NextResponse.json({
      success: true,
      data: admin,
      message: 'Data admin berhasil diambil'
    });
  } catch (e) {
    if (e instanceof ApiError) {
      return NextResponse.json(
        { 
          success: false,
          error: e.message 
        },
        { status: e.status }
      );
    }

    console.error('GET Admin Error:', e);
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error" 
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin-token")?.value;
    
    if (!token) {
      throw new ApiError(ErrorCode.UNAUTHORIZED, 'Unauthorized', 401);
    }

    const payload = await verifyJWT(token);
    if (payload.role !== "admin") {
      throw new ApiError(ErrorCode.FORBIDDEN, 'Forbidden', 403);
    }

    // Validate CSRF
    const csrfToken = request.headers.get("X-CSRF-Token");
    const storedCsrfToken = cookieStore.get("csrf-token")?.value;

    if (!csrfToken || !storedCsrfToken || csrfToken !== storedCsrfToken) {
      throw new ApiError(ErrorCode.FORBIDDEN, 'Invalid CSRF token', 403);
    }

    // Prevent updating super admin
    if (params.id === process.env.SUPER_ADMIN_ID) {
      throw new ApiError(
        ErrorCode.FORBIDDEN,
        'Tidak dapat mengubah akun super admin',
        403
      );
    }

    const body = await request.json();
    const admin = await updateAdmin(params.id, body);

    return NextResponse.json({
      success: true,
      data: admin,
      message: 'Admin berhasil diupdate'
    });
  } catch (e) {
    if (e instanceof ApiError) {
      return NextResponse.json(
        { 
          success: false,
          error: e.message 
        },
        { status: e.status }
      );
    }

    if (e instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: e.errors
        },
        { status: 400 }
      );
    }

    console.error('PATCH Admin Error:', e);
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error" 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin-token")?.value;
    
    if (!token) {
      throw new ApiError(ErrorCode.UNAUTHORIZED, 'Unauthorized', 401);
    }

    const payload = await verifyJWT(token);
    if (payload.role !== "admin") {
      throw new ApiError(ErrorCode.FORBIDDEN, 'Forbidden', 403);
    }

    // Validate CSRF
    const csrfToken = request.headers.get("X-CSRF-Token");
    const storedCsrfToken = cookieStore.get("csrf-token")?.value;

    if (!csrfToken || !storedCsrfToken || csrfToken !== storedCsrfToken) {
      throw new ApiError(ErrorCode.FORBIDDEN, 'Invalid CSRF token', 403);
    }

    // Prevent deleting super admin
    if (params.id === process.env.SUPER_ADMIN_ID) {
      throw new ApiError(
        ErrorCode.FORBIDDEN,
        'Tidak dapat menghapus akun super admin',
        403
      );
    }

    // Prevent self-deletion
    if (params.id === payload.sub) {
      throw new ApiError(
        ErrorCode.FORBIDDEN,
        'Tidak dapat menghapus akun sendiri',
        403
      );
    }

    await deleteAdmin(params.id);

    return NextResponse.json({
      success: true,
      message: 'Admin berhasil dihapus'
    });
  } catch (e) {
    if (e instanceof ApiError) {
      return NextResponse.json(
        { 
          success: false,
          error: e.message 
        },
        { status: e.status }
      );
    }

    console.error('DELETE Admin Error:', e);
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error" 
      },
      { status: 500 }
    );
  }
}