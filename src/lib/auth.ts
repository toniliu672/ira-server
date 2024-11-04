// src/lib/auth.ts

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { JWTPayload } from '@/types/auth';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secure-jwt-secret-key'
);

export async function signJWT(payload: JWTPayload): Promise<string> {
  try {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('1h')
      .setIssuedAt()
      .sign(JWT_SECRET);
    
    return token;
  } catch (e) {
    const error = e as Error;
    console.error('JWT Sign Error:', error.message);
    throw new Error('Failed to sign JWT');
  }
}

export async function verifyJWT(token: string): Promise<JWTPayload> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as JWTPayload;
  } catch (e) {
    const error = e as Error;
    console.error('JWT Verify Error:', error.message);
    throw new Error('Invalid token');
  }
}

export async function getJWTFromCookies(request?: NextRequest): Promise<string | null> {
  if (request) {
    const token = request.cookies.get('admin-token')?.value;
    return token || null;
  }

  const cookieStore = cookies();
  const token = cookieStore.get('admin-token')?.value;
  return token || null;
}