// src/app/api/v1/materi/[materiId]/video/[videoId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth";
import { 
  updateVideoMateri,
  deleteVideoMateri, 
  getVideoMateriById
} from "@/services/videoMateriService";
import { ApiError } from "@/lib/errors";
import { videoMateriInputSchema } from "@/types/materi";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ materiId: string; videoId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin-token")?.value;

    if (!token) {
      throw new ApiError("UNAUTHORIZED", "Unauthorized", 401);
    }

    await verifyJWT(token);

    const { materiId, videoId } = await params;
    const videoMateri = await getVideoMateriById(videoId);

    // Validate that videoMateri belongs to the specified materi
    if (videoMateri.materiId !== materiId) {
      throw new ApiError("NOT_FOUND", "Video materi tidak ditemukan", 404);
    }

    return NextResponse.json({
      success: true,
      data: videoMateri
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
  { params }: { params: Promise<{ materiId: string; videoId: string }> }
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

    const { materiId, videoId } = await params;
    const formData = await request.formData();
    const videoFile = formData.get("video") as File | null;
    const thumbnailFile = formData.get("thumbnail") as File | null;
    const dataStr = formData.get("data") as string;

    const data = JSON.parse(dataStr);
    const validatedData = videoMateriInputSchema.partial().parse({
      ...data,
      materiId,
    });

    // Update video materi
    const videoMateri = await updateVideoMateri(
      videoId,
      {
        judul: validatedData.judul,
        deskripsi: validatedData.deskripsi,
        durasi: validatedData.durasi,
      },
      videoFile || undefined,
      thumbnailFile || undefined
    );

    return NextResponse.json({
      success: true,
      data: videoMateri,
      message: "Video materi berhasil diupdate"
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ materiId: string; videoId: string }> }
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

    const { materiId, videoId } = await params;
    // Check if video exists and belongs to the materi
    const videoMateri = await getVideoMateriById(videoId);
    if (!videoMateri || videoMateri.materiId !== materiId) {
      throw new ApiError("NOT_FOUND", "Video materi tidak ditemukan", 404);
    }

    // Delete video materi and its media files
    await deleteVideoMateri(videoId);

    return NextResponse.json({
      success: true,
      message: "Video materi berhasil dihapus"
    });
  } catch (e) {
    if (e instanceof ApiError) {
      return NextResponse.json(
        { success: false, error: e.message },
        { status: e.status }
      );
    }
    console.error("Delete video materi error:", e);
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Internal server error" },
      { status: 500 }
    );
  }
}