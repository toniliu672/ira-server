// src/lib/auth.ts

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import type { JWTPayload as CustomJWTPayload } from "@/types/auth";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function signJWT(payload: CustomJWTPayload): Promise<string> {
  try {
    const jwt = await new SignJWT({
      sub: payload.sub,
      username: payload.username,
      email: payload.email,
      role: payload.role as string,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .sign(JWT_SECRET);

    return jwt;
  } catch (e) {
    const error = e as Error;
    console.error("JWT Sign Error:", error.message);
    throw new Error("Failed to sign JWT");
  }
}

export async function verifyJWT(token: string): Promise<CustomJWTPayload> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    if (!payload.sub || !payload.username || !payload.email || !payload.role) {
      throw new Error("Invalid token payload");
    }

    return {
      sub: payload.sub as string,
      username: payload.username as string,
      email: payload.email as string,
      role: payload.role as "admin" | "user",
    };
  } catch (e) {
    const error = e as Error;
    console.error("JWT Verify Error:", error.message);
    throw new Error("Invalid token");
  }
}

export async function getJWTFromCookies(
  request?: NextRequest
): Promise<string | null> {
  try {
    if (request) {
      return request.cookies.get("admin-token")?.value ?? null;
    }

    const cookieStore = await cookies();
    return cookieStore.get("admin-token")?.value ?? null;
  } catch (e) {
    const error = e as Error;
    console.error("Get JWT from Cookies Error:", error.message);
    return null;
  }
}
