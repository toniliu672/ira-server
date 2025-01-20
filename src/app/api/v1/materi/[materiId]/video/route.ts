// src/app/api/v1/materi/[materiId]/video/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth";
import {
  getVideoMateriByMateriId,
  createVideoMateri,
} from "@/services/videoMateriService";
import { ApiError } from "@/lib/errors";
import { videoMateriInputSchema } from "@/types/materi";
import type { Prisma } from "@prisma/client";

// Improved YouTube ID extraction
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

export async function POST(
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
    const body = await request.json();

    // Extract YouTube ID before validation
    const youtubeId = extractYoutubeId(body.videoUrl);
    if (!youtubeId) {
      throw new ApiError(
        "VALIDATION_ERROR",
        "URL video YouTube tidak valid",
        400
      );
    }

    // First validate the input without youtubeId
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { youtubeId: _, ...inputData } = body;
    await videoMateriInputSchema.parseAsync({
      ...inputData,
      materiId,
    });

    // Prepare create data
    const createData: Prisma.VideoMateriCreateInput = {
      judul: body.judul,
      deskripsi: body.deskripsi || null,
      videoUrl: body.videoUrl,
      youtubeId: youtubeId,
      thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
      durasi: body.durasi,
      status: true,
      materiRef: {
        connect: { id: materiId },
      },
      urutan: 1, // Will be updated by service
    };

    // Create video materi
    const videoMateri = await createVideoMateri(createData);

    return NextResponse.json(
      {
        success: true,
        data: videoMateri,
        message: "Video materi berhasil dibuat",
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("Create video materi error:", e);
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
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") !== "false";

    const videoMateri = await getVideoMateriByMateriId({
      materiId,
      search,
      status,
    });

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
