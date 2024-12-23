// src/app/api/v1/materi/[materiId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { verifyJWT } from "@/lib/auth";
import { getMateriById, updateMateri, deleteMateri } from "@/services/materiService";
import { ApiError } from "@/lib/errors";
import { materiSchema } from "@/types/materi";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ materiId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin-token")?.value;

    if (!token) {
      throw new ApiError("UNAUTHORIZED", "Unauthorized", 401);
    }

    await verifyJWT(token);

    const { materiId } = await params;
    const materi = await getMateriById(materiId);

    return NextResponse.json({
      success: true,
      data: materi
    });
  } catch (e) {
    if (e instanceof ApiError) {
      return NextResponse.json(
        { success: false, error: e.message },
        { status: e.status }
      );
    }
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ materiId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin-token")?.value;

    if (!token) {
      throw new ApiError("UNAUTHORIZED", "Unauthorized", 401);
    }

    await verifyJWT(token);

    // Validate CSRF
    const csrfToken = request.headers.get("X-CSRF-Token");
    const storedCsrfToken = cookieStore.get("csrf-token")?.value;

    if (!csrfToken || !storedCsrfToken || csrfToken !== storedCsrfToken) {
      throw new ApiError("FORBIDDEN", "Invalid CSRF token", 403);
    }

    const { materiId } = await params;

    // Check if materi exists
    const existingMateri = await getMateriById(materiId);
    if (!existingMateri) {
      throw new ApiError("NOT_FOUND", "Materi tidak ditemukan", 404);
    }

    const body = await request.json();
    
    // Remove undefined/null values and ensure arrays are not empty
    const cleanData = {
      ...(body.judul && { judul: body.judul }),
      ...(body.deskripsi && { deskripsi: body.deskripsi }),
      ...(body.thumbnailUrl && { thumbnailUrl: body.thumbnailUrl }),
      ...(body.urutan && { urutan: body.urutan }),
      ...(typeof body.status === 'boolean' && { status: body.status }),
      ...(Array.isArray(body.tujuanPembelajaran) && body.tujuanPembelajaran.length > 0 && { 
        tujuanPembelajaran: body.tujuanPembelajaran
      }),
      ...(Array.isArray(body.capaianPembelajaran) && body.capaianPembelajaran.length > 0 && {
        capaianPembelajaran: body.capaianPembelajaran
      })
    };

    const validatedData = materiSchema.partial().parse(cleanData);
    const materi = await updateMateri(materiId, validatedData);

    return NextResponse.json({
      success: true,
      data: materi,
      message: "Materi berhasil diupdate"
    });
  } catch (e) {
    console.error("PATCH Materi Error:", e);
    
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation error", details: e.errors },
        { status: 400 }
      );
    }
    if (e instanceof ApiError) {
      return NextResponse.json(
        { success: false, error: e.message },
        { status: e.status }
      );
    }
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ materiId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin-token")?.value;

    if (!token) {
      throw new ApiError("UNAUTHORIZED", "Unauthorized", 401);
    }

    await verifyJWT(token);

    // Validate CSRF
    const csrfToken = request.headers.get("X-CSRF-Token");
    const storedCsrfToken = cookieStore.get("csrf-token")?.value;

    if (!csrfToken || !storedCsrfToken || csrfToken !== storedCsrfToken) {
      throw new ApiError("FORBIDDEN", "Invalid CSRF token", 403);
    }

    const { materiId } = await params;
    await deleteMateri(materiId);

    return NextResponse.json({
      success: true,
      message: "Materi berhasil dihapus"
    });
  } catch (e) {
    if (e instanceof ApiError) {
      return NextResponse.json(
        { success: false, error: e.message },
        { status: e.status }
      );
    }
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}