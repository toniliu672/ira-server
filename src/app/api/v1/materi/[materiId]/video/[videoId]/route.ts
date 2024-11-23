// src/app/api/v1/materi/[materiId]/video/[videoId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { verifyJWT } from "@/lib/auth";
import {
  getVideoMateriById,
  updateVideoMateri,
  deleteVideoMateri,
  reorderVideoMateri,
} from "@/services/videoMateriService";
import { ApiError } from "@/lib/errors";
import { videoMateriSchema } from "@/types/materi";

export async function GET(
  request: NextRequest,
  { params }: { params: { materiId: string; videoId: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin-token")?.value;

    if (!token) {
      throw new ApiError("UNAUTHORIZED", "Unauthorized", 401);
    }

    await verifyJWT(token);

    const videoMateri = await getVideoMateriById(params.videoId);

    // Validate that videoMateri belongs to the specified materi
    if (videoMateri.materiId !== params.materiId) {
      throw new ApiError("NOT_FOUND", "Video materi tidak ditemukan", 404);
    }

    return NextResponse.json({
      success: true,
      data: videoMateri,
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
  { params }: { params: { materiId: string; videoId: string } }
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

    // Check if this is a reorder operation
    const contentType = request.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      const body = await request.json();
      if (body.orderedIds) {
        await reorderVideoMateri(params.materiId, body.orderedIds);
        return NextResponse.json({
          success: true,
          message: "Urutan video materi berhasil diupdate",
        });
      }

      const validatedData = videoMateriSchema.partial().parse(body);
      const videoMateri = await updateVideoMateri(
        params.videoId,
        validatedData
      );

      return NextResponse.json({
        success: true,
        data: videoMateri,
        message: "Video materi berhasil diupdate",
      });
    }

    // Handle multipart form-data for file uploads
    const formData = await request.formData();
    const videoFile = formData.get("video") as File | null;
    const thumbnailFile = formData.get("thumbnail") as File | null;
    const data = JSON.parse(formData.get("data") as string);

    const validatedData = videoMateriSchema.partial().parse(data);

    const videoMateri = await updateVideoMateri(
      params.videoId,
      validatedData,
      videoFile || undefined,
      thumbnailFile || undefined
    );

    return NextResponse.json({
      success: true,
      data: videoMateri,
      message: "Video materi berhasil diupdate",
    });
  } catch (e) {
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
  { params }: { params: { materiId: string; videoId: string } }
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

    const videoMateri = await getVideoMateriById(params.videoId);

    // Validate that videoMateri belongs to the specified materi
    if (videoMateri.materiId !== params.materiId) {
      throw new ApiError("NOT_FOUND", "Video materi tidak ditemukan", 404);
    }

    await deleteVideoMateri(params.videoId);

    return NextResponse.json({
      success: true,
      message: "Video materi berhasil dihapus",
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
