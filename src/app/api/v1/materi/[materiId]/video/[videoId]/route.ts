// src/app/api/v1/materi/[materiId]/video/[videoId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth";
import {
  updateVideoMateri,
  deleteVideoMateri,
  getVideoMateriById,
} from "@/services/videoMateriService";
import { ApiError } from "@/lib/errors";
import { videoMateriInputSchema } from "@/types/materi";

// Function to extract YouTube video ID
function extractYoutubeId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    // Handle youtube.com/watch?v= format
    if (urlObj.hostname.includes("youtube.com")) {
      if (urlObj.pathname === "/watch") {
        return urlObj.searchParams.get("v");
      }
      // Handle youtube.com/embed/ format
      if (urlObj.pathname.startsWith("/embed/")) {
        return urlObj.pathname.split("/")[2];
      }
    }
    // Handle youtu.be format
    if (urlObj.hostname === "youtu.be") {
      return urlObj.pathname.substring(1);
    }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    // If URL parsing fails, try regex as fallback
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/,
      /^[a-zA-Z0-9_-]{11}$/, // Direct video ID
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
  }
  return null;
}

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
    const body = await request.json();

    // Extract YouTube ID if URL is being updated
    let youtubeId = undefined;
    if (body.videoUrl) {
      youtubeId = extractYoutubeId(body.videoUrl);
      if (!youtubeId) {
        throw new ApiError(
          "VALIDATION_ERROR",
          "URL video YouTube tidak valid",
          400
        );
      }
    }

    // Validate the input data
    const validatedData = await videoMateriInputSchema.partial().parseAsync({
      ...body,
      materiId,
      youtubeId,
    });

    // Update data preparation
    const updateData = {
      ...(validatedData.judul && { judul: validatedData.judul }),
      ...(validatedData.deskripsi && { deskripsi: validatedData.deskripsi }),
      ...(validatedData.durasi && { durasi: validatedData.durasi }),
      ...(youtubeId && {
        videoUrl: validatedData.videoUrl,
        youtubeId: youtubeId,
        thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
      }),
    };

    // Update video materi
    const videoMateri = await updateVideoMateri(videoId, updateData);

    return NextResponse.json({
      success: true,
      data: videoMateri,
      message: "Video materi berhasil diupdate",
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

    // Delete video materi
    await deleteVideoMateri(videoId);

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
    console.error("Delete video materi error:", e);
    return NextResponse.json(
      {
        success: false,
        error: e instanceof Error ? e.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
