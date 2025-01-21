// src/config/mobileAuth.ts

export const MOBILE_AUTH_CONFIG = {
  jwt: {
    accessToken: {
      secret: process.env.JWT_SECRET!,
    },
  },

  // Basic Password Policy
  password: {
    minLength: 8,
  },

  // Basic Rate Limiting - Hanya untuk mencegah spam
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit lebih longgar
  },

  // Cookie Settings
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  },
};

// Validation regex patterns
export const MOBILE_VALIDATION = {
  username: /^[a-zA-Z0-9_]{3,20}$/,
  password: /^.{8,}$/,
  phone: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
};

// Simplified error messages
export const MOBILE_AUTH_ERRORS = {
  INVALID_CREDENTIALS: "Username atau password salah",
  USER_NOT_FOUND: "Akun tidak ditemukan",
  USER_INACTIVE: "Akun tidak aktif",
} as const;
