// src/config/auth.ts

export const AUTH_CONFIG = {
  jwt: {
    accessToken: {
      secret: process.env.JWT_ACCESS_SECRET!,
    },
    refreshToken: {
      secret: process.env.JWT_REFRESH_SECRET!,
      cookieName: 'refresh_token',
    }
  },
  
  // Password Policy
  password: {
    minLength: 8,
    maxAttempts: 10, // Maximum failed login attempts before temporary lock
    lockDuration: 15 * 60 * 1000, // 15 minutes lock after max attempts
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    loginMax: 5, // Stricter limit for login attempts
    loginWindowMs: 5 * 60 * 1000, // 5 minutes for login attempts
  },
  
  // CSRF Protection
  csrf: {
    cookieName: 'csrf-token',
    headerName: 'X-CSRF-Token',
  },
  
  // Cookie Settings
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
  },

  // Mobile Settings
  mobile: {
    deviceIdHeader: 'X-Device-ID',
    requiredForMobile: true, // Require device ID for mobile requests
  },

  // Session Management
  session: {
    maxDevices: 5, // Maximum number of active devices per user
    revokeOthersOnNewDevice: false, // Whether to revoke other sessions on new device login
  }
};

// Validation regex patterns
export const VALIDATION_PATTERNS = {
  username: /^[a-zA-Z0-9_]{3,20}$/, // 3-20 chars, alphanumeric + underscore
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  phone: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, // International phone format
};

// Error messages
export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid username or password',
  ACCOUNT_LOCKED: 'Account temporarily locked due to too many failed attempts',
  DEVICE_LIMIT_REACHED: 'Maximum number of devices reached',
  DEVICE_ID_REQUIRED: 'Device ID is required for mobile authentication',
  CSRF_MISMATCH: 'CSRF token mismatch',
  TOKEN_EXPIRED: 'Access token has expired',
  INVALID_TOKEN: 'Invalid token',
  USER_NOT_FOUND: 'User not found',
  USER_INACTIVE: 'User account is inactive',
} as const;