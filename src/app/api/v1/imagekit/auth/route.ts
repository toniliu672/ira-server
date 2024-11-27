// src/app/api/v1/imagekit/auth/route.ts

import { NextResponse } from "next/server";
import crypto from 'crypto';

export async function GET() {
  try {
    // Get required environment variables
    const privateKey = process.env.PRIVATE_KEY;
    const token = crypto.randomBytes(32).toString('hex');
    const expire = Math.floor(Date.now() / 1000) + 60 * 30; // 30 minutes expiry

    if (!privateKey) {
      throw new Error('PRIVATE_KEY is not set');
    }

    // Generate signature
    const signatureString = token + expire;
    const signature = crypto
      .createHmac('sha1', privateKey)
      .update(signatureString)
      .digest('hex');

    return NextResponse.json({
      signature,
      expire,
      token
    });
  } catch (error) {
    console.error("ImageKit Auth Error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}