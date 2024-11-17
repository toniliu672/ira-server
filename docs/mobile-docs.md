# Mobile Authentication API Specification

## Login
**Endpoint:** POST /api/v1/auth/mobile/login  
**Description:** Login untuk aplikasi mobile dengan dukungan multi-device  

**Request Headers:**
```
X-Device-ID: string (required) - Unique identifier perangkat
```

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "string",
    "refreshToken": "string",
    "user": {
      "id": "string",
      "username": "string",
      "fullName": "string",
      "email": "string",
      "gender": "MALE" | "FEMALE",
      "activeStatus": boolean
    }
  }
}
```

**Error Responses:**
- `400` - Device ID tidak ada atau input tidak valid
- `401` - Kredensial tidak valid atau akun nonaktif
- `403` - Jumlah maksimum device tercapai
- `429` - Rate limit exceeded

## Logout
**Endpoint:** POST /api/v1/mobile/auth/logout  
**Description:** Logout dari aplikasi mobile dan menonaktifkan refresh token untuk device tertentu

**Request Headers:**
```
Authorization: Bearer <accessToken>
X-Device-ID: string (optional)
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Error Responses:**
- `401` - Token tidak valid atau tidak ditemukan
- `429` - Rate limit exceeded