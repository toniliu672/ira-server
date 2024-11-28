// src/app/api/v1/auth/admin/login/route.ts

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import prisma from "@/lib/prisma";
import { signJWT } from "@/lib/auth";
import type { AuthResponse, LoginCredentials } from "@/types/auth";

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest
): Promise<NextResponse<AuthResponse>> {
  try {
    const body: LoginCredentials = await request.json();

    const admin = await prisma.admin.findUnique({
      where: { username: body.username },
      select: {
        id: true,
        username: true,
        password: true,
        name: true,
        email: true
      }
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(body.password, admin.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate tokens
    const token = await signJWT({
      sub: admin.id,
      username: admin.username,
      email: admin.email,
      role: "admin",
    });
    
    // Generate CSRF token for subsequent requests
    const csrfToken = uuidv4();
    
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: admin.id,
          username: admin.username,
          name: admin.name,
          email: admin.email,
        },
      },
    });

    // Set tokens in cookies
    response.cookies.set({
      name: "admin-token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    response.cookies.set({
      name: "csrf-token",
      value: csrfToken,
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;

  } catch (e) {
    console.error("Login Error:", e);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}