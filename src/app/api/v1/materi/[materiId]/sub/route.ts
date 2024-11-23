// src/app/api/v1/materi/[materiId]/sub/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { verifyJWT } from "@/lib/auth";
import { getSubMateriByMateriId, createSubMateri } from "@/services/subMateriService";
import { ApiError } from "@/lib/errors";
import { subMateriSchema } from "@/types/materi";

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

    const subMateri = await getSubMateriByMateriId({
      materiId,
      search,
      status
    });

    return NextResponse.json({
      success: true,
      data: subMateri
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
    const body = await request.json();
    const validatedData = subMateriSchema.parse({
      ...body,
      materiId
    });

    const subMateri = await createSubMateri({
      ...validatedData,
      materiRef: {
        connect: { id: materiId }
      }
    });

    return NextResponse.json({
      success: true,
      data: subMateri,
      message: "Sub materi berhasil dibuat"
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