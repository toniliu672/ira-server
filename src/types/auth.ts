// src/types/auth.ts

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface BaseAuthResponse {
  success: boolean;
  message: string;
}

// Interface untuk respons admin login
export interface AdminAuthResponse extends BaseAuthResponse {
  data?: {
    token: string;
    user: {
      id: string;
      username: string;
      name: string;
      email: string;
    }
  }
}

// Interface untuk respons user/student login
export interface UserAuthResponse extends BaseAuthResponse {
  data?: {
    accessToken: string;
    user: {
      id: string;
      username: string;
      fullName: string;
      email: string;
      gender: 'MALE' | 'FEMALE';
      activeStatus: boolean;
    }
  }
}

export type AuthResponse = AdminAuthResponse | UserAuthResponse;

export interface ApiError {
  code: string;
  message: string;
  status: number;
}

// Removed exp and iat as we no longer use token expiry
export interface JWTPayload {
  sub: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
}