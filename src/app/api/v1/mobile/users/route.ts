// src/app/api/v1/mobile/users/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createUser } from "@/services/adminUserService";
import { userSchema } from "@/types/user";
import { ApiError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validasi input dasar
    const validatedData = userSchema.parse({
      ...body,
      activeStatus: true,
    });
    
    const user = await createUser(validatedData);
    
    return NextResponse.json({
      success: true,
      message: "Successfully registered user",
      data: user
    }, { status: 201 });
  } catch (e) {
    console.error("Mobile User Creation Error:", e);
    if (e instanceof ApiError) {
      return NextResponse.json(
        { 
          success: false,
          message: e.message,
          error: e.code 
        }, 
        { status: e.status }
      );
    }
    return NextResponse.json(
      { 
        success: false,
        message: "Internal server error",
        error: "INTERNAL_ERROR" 
      },
      { status: 500 }
    );
  }
}