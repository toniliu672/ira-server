// src/app/api/v1/mobile/materi/[materiId]/video/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getVideoMateriByMateriId } from "@/services/videoMateriService";
import { getMateriById } from "@/services/materiService";
import { ApiError } from "@/lib/errors";
import { verifyJWT } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ materiId: string }> }
) {
  try {
    await limiter.check(req, 30);

    // Validate token
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

    const { materiId } = await params;

    // Check if materi exists and is active first
    const materi = await getMateriById(materiId);
    if (!materi || !materi.status) {
      throw new ApiError("NOT_FOUND", "Materi tidak ditemukan", 404);
    }

    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search") || "";

    // Get videos, only return active ones
    const videoMateri = await getVideoMateriByMateriId({
      materiId,
      search,
      status: true,
    });

    // Transform response to only include necessary data for mobile
    const transformedVideos = videoMateri.map((video) => ({
      id: video.id,
      judul: video.judul,
      deskripsi: video.deskripsi,
      youtubeId: video.youtubeId,
      thumbnailUrl: video.thumbnailUrl,
      durasi: video.durasi,
      urutan: video.urutan,
    }));

    return NextResponse.json({
      success: true,
      message: "Successfully retrieved video materi list",
      data: transformedVideos,
    });
  } catch (e) {
    console.error("Mobile Get Video Materi Error:", e);
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
