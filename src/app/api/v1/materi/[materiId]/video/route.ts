// src/app/api/v1/materi/[materiId]/video/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { verifyJWT } from "@/lib/auth";
import { getVideoMateriByMateriId, createVideoMateri } from "@/services/videoMateriService";
import { ApiError } from "@/lib/errors";
import { videoMateriSchema } from "@/types/materi";

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
    const videoFile = formData.get("video") as File;
    const thumbnailFile = formData.get("thumbnail") as File | null;
    const data = JSON.parse(formData.get("data") as string);

    const validatedData = videoMateriSchema.parse({
      ...data,
      materiId
    });

    const videoMateri = await createVideoMateri(
      {
        ...validatedData,
        materiRef: {
          connect: { id: materiId }
        }
      },
      videoFile,
      thumbnailFile || undefined
    );

    return NextResponse.json({
      success: true,
      data: videoMateri,
      message: "Video materi berhasil dibuat"
    }, { status: 201 });
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