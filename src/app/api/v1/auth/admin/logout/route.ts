// src/app/api/v1/auth/admin/logout/route.ts

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(): Promise<NextResponse> {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

    // Clear cookie from response
    response.cookies.delete('admin-token');

    // Clear from cookie store
    const cookieStore = await cookies();
    cookieStore.delete('admin-token');

    return response;
  } catch (e) {
    const error = e as Error;
    console.error('Logout Error:', error.message);
    
    return NextResponse.json(
      { success: false, message: 'Failed to logout' },
      { status: 500 }
    );
  }
}