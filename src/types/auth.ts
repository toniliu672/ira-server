// src/types/auth.ts

export interface LoginCredentials {
    username: string;
    password: string;
  }
  
  export interface AuthResponse {
    success: boolean;
    message: string;
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
  
  export interface ApiError {
    code: string;
    message: string;
    status: number;
  }
  
  export interface JWTPayload {
    sub: string;
    username: string;
    email: string;
    role: 'admin';
    iat?: number;
    exp?: number;
  }