// src/app/api/v1/auth/admin/login/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';
import { signJWT } from '@/lib/auth';
import type { AuthResponse, LoginCredentials } from '@/types/auth';

export async function POST(request: NextRequest): Promise<NextResponse<AuthResponse>> {
  try {
    const body: LoginCredentials = await request.json();
    
    const admin = await prisma.admin.findUnique({
      where: { username: body.username }
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(body.password, admin.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = await signJWT({
      sub: admin.id,
      username: admin.username,
      email: admin.email,
      role: 'admin'
    });

    // Set HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set({
      name: 'admin-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: admin.id,
          username: admin.username,
          name: admin.name,
          email: admin.email
        }
      }
    });
  } catch (e) {
    const error = e as Error;
    console.error('Login Error:', error.message);
    
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}