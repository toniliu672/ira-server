// src/app/api/v1/mobile/materi/[materiId]/sub/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getSubMateriByMateriId } from "@/services/subMateriService";
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
    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search") || "";

    const subMateri = await getSubMateriByMateriId({
      materiId,
      search,
      status: true // Only get active sub materi
    });

    return NextResponse.json({
      success: true,
      message: "Successfully retrieved sub materi list",
      data: subMateri
    });
  } catch (e) {
    console.error("Mobile Get Sub Materi Error:", e);
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