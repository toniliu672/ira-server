# Mobile Users API Specification

## Registration
**Endpoint:** POST /api/v1/mobile/users  
**Description:** Register akun baru untuk aplikasi mobile

**Request Headers:**
```
X-Device-ID: string (required) - Unique identifier perangkat
```

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "fullName": "string",
  "gender": "MALE" | "FEMALE",
  "phone": "string" (optional),
  "address": "string" (optional)
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Successfully registered user",
  "data": {
    "id": "string",
    "username": "string",
    "email": "string",
    "fullName": "string",
    "gender": "MALE" | "FEMALE",
    "phone": "string",
    "address": "string",
    "activeStatus": true,
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

## Update Profile
**Endpoint:** PATCH /api/v1/mobile/users/me  
**Description:** Update profil pengguna yang sedang login

**Request Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:** (semua field optional)
```json
{
  "username": "string",
  "email": "string",
  "fullName": "string",
  "phone": "string",
  "address": "string"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Successfully updated profile",
  "data": {
    // Updated user data
  }
}
```

## Update Password
**Endpoint:** PUT /api/v1/mobile/users/me/password  
**Description:** Mengubah password pengguna

**Request Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Successfully updated password"
}
```

## Get User Devices
**Endpoint:** GET /api/v1/mobile/users/me  
**Description:** Mendapatkan daftar perangkat yang terdaftar untuk pengguna

**Request Headers:**
```
Authorization: Bearer <accessToken>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Successfully retrieved devices",
  "data": [
    {
      "id": "string",
      "deviceId": "string",
      "lastLogin": "datetime",
      "deviceInfo": "string"
    }
  ]
}
```

**Common Error Responses:**
- `400` - Input tidak valid atau device ID tidak ada
- `401` - Token tidak ada atau tidak valid
- `403` - Token type tidak sesuai
- `409` - Username/email sudah digunakan
- `429` - Rate limit exceeded