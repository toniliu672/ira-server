// src/app/api/v1/admin/materi/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { verifyJWT } from "@/lib/auth";
import { materiUpdateSchema } from "@/types/materi";
import {
  getMateriById,
  updateMateri,
  deleteMateri
} from "@/services/materiService";
import { ApiError } from "@/lib/errors";
import { rateLimit } from "@/lib/rate-limit";

// Cache tags
const CACHE_TAGS = {
  MATERI_LIST: 'materi-list',
  getMateriDetailTag: (id: string) => `materi-detail-${id}`
} as const;

// Rate limiting config
const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500
});

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await limiter.check(req, 60);

    const cookieStore = await cookies();
    const token = cookieStore.get("admin-token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Token tidak ditemukan",
          error: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(token);
    if (payload.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Akses ditolak",
          error: "FORBIDDEN",
        },
        { status: 403 }
      );
    }

    const { id } = context.params;
    const materi = await getMateriById(id);

    return NextResponse.json({
      success: true,
      message: "Berhasil mengambil detail materi",
      data: materi,
    });
  } catch (e) {
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
    console.error("Admin Get Materi Detail Error:", e);
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

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await limiter.check(req, 30);

    const cookieStore = await cookies();
    const token = cookieStore.get("admin-token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Token tidak ditemukan",
          error: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(token);
    if (payload.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Akses ditolak",
          error: "FORBIDDEN",
        },
        { status: 403 }
      );
    }

    // Validate CSRF token
    const csrfToken = req.headers.get("x-csrf-token");
    const storedCsrfToken = cookieStore.get("csrf-token")?.value;

    if (!csrfToken || !storedCsrfToken || csrfToken !== storedCsrfToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid CSRF token",
          error: "FORBIDDEN",
        },
        { status: 403 }
      );
    }

    const { id } = context.params;
    const body = await req.json();
    const validatedData = materiUpdateSchema.parse(body);

    const materi = await updateMateri(id, validatedData, payload.sub);

    // Revalidate cache
    revalidateTag(CACHE_TAGS.MATERI_LIST);
    revalidateTag(CACHE_TAGS.getMateriDetailTag(id));

    return NextResponse.json({
      success: true,
      message: "Berhasil mengupdate materi",
      data: materi,
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Validasi gagal",
          error: "VALIDATION_ERROR",
          details: e.errors,
        },
        { status: 400 }
      );
    }

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

    console.error("Admin Update Materi Error:", e);
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

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await limiter.check(req, 20);

    const cookieStore = await cookies();
    const token = cookieStore.get("admin-token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Token tidak ditemukan",
          error: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(token);
    if (payload.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Akses ditolak",
          error: "FORBIDDEN",
        },
        { status: 403 }
      );
    }

    // Validate CSRF token
    const csrfToken = req.headers.get("x-csrf-token");
    const storedCsrfToken = cookieStore.get("csrf-token")?.value;

    if (!csrfToken || !storedCsrfToken || csrfToken !== storedCsrfToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid CSRF token",
          error: "FORBIDDEN",
        },
        { status: 403 }
      );
    }

    const { id } = context.params;
    await deleteMateri(id);

    // Revalidate cache
    revalidateTag(CACHE_TAGS.MATERI_LIST);
    revalidateTag(CACHE_TAGS.getMateriDetailTag(id));

    return NextResponse.json({
      success: true,
      message: "Berhasil menghapus materi",
    });
  } catch (e) {
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

    console.error("Admin Delete Materi Error:", e);
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