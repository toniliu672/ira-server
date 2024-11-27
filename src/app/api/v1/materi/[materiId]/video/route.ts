// src/app/api/v1/materi/[materiId]/video/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth";
import { 
  getVideoMateriByMateriId, 
  createVideoMateri 
} from "@/services/videoMateriService";
import { ApiError } from "@/lib/errors";
import { videoMateriInputSchema } from "@/types/materi";
import type { Prisma } from "@prisma/client";

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
    const formData = await request.formData();
    const video = formData.get("video") as File;
    const thumbnail = formData.get("thumbnail") as File | null;
    const dataStr = formData.get("data") as string;
    
    if (!video) {
      throw new ApiError("VALIDATION_ERROR", "Video file is required", 400);
    }

    // Parse and validate input data
    const data = JSON.parse(dataStr);
    const validatedData = videoMateriInputSchema.parse({
      ...data,
      materiId,
    });

    // Prepare create data
    const createData: Prisma.VideoMateriCreateInput = {
      judul: validatedData.judul,
      deskripsi: validatedData.deskripsi,
      durasi: validatedData.durasi,
      status: true,
      materiRef: {
        connect: { id: materiId }
      },
      // videoUrl dan urutan akan diisi oleh service
      videoUrl: "", // temporary, will be replaced by service
      urutan: 1     // temporary, will be replaced by service
    };

    // Create video materi
    const videoMateri = await createVideoMateri(
      createData,
      video,
      thumbnail || undefined
    );

    return NextResponse.json({
      success: true,
      data: videoMateri,
      message: "Video materi berhasil dibuat"
    }, { status: 201 });
  } catch (e) {
    if (e instanceof ApiError) {
      return NextResponse.json(
        { success: false, error: e.message },
        { status: e.status }
      );
    }
    console.error("Create video materi error:", e);
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
      status
    });

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