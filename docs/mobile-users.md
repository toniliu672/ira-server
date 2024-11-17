# Mobile Users API Specification

## Overview
Base URL: `/api/v1/mobile`
Semua endpoint membutuhkan rate limiting dan proper error handling.

## Authentication
- Semua endpoint protected menggunakan Bearer token di header
- Format: `Authorization: Bearer <token>`
- Rate limiting diterapkan untuk membatasi request

## Endpoints

### Get Profile
**Endpoint:** GET `/users/me`  
**Description:** Mendapatkan profil user yang sedang login

**Request Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Successfully retrieved profile",
  "data": {
    "id": "string",
    "username": "string",
    "email": "string",
    "fullName": "string",
    "gender": "MALE" | "FEMALE",
    "phone": "string",
    "address": "string",
    "activeStatus": boolean,
    "lastLogin": "datetime",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

### Update Profile
**Endpoint:** PATCH `/users/me`  
**Description:** Update profil pengguna yang sedang login

**Request Headers:**
```
Authorization: Bearer <token>
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

**Notes:**
- Fields `role`, `deviceId`, dan `activeStatus` tidak dapat diubah melalui endpoint ini
- Username dan email akan dicek untuk duplikasi sebelum update

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Successfully updated profile",
  "data": {
    // Updated user data similar to Get Profile response
  }
}
```

### Update Password
**Endpoint:** PUT `/users/me/password`  
**Description:** Mengubah password pengguna

**Request Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

**Notes:**
- Password baru harus memenuhi kebijakan password (minimal 8 karakter, dll)
- Rate limit lebih ketat untuk endpoint password

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Successfully updated password"
}
```

### Get User Devices
**Endpoint:** GET `/users/me/devices`  
**Description:** Mendapatkan daftar perangkat yang terdaftar untuk pengguna

**Request Headers:**
```
Authorization: Bearer <token>
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
      "lastLogin": "datetime"
    }
  ]
}
```

## Error Handling

Semua endpoint mengembalikan format error yang konsisten:

```json
{
  "success": false,
  "message": "Error message",
  "error": "ERROR_CODE"
}
```

### Common Error Codes & Status:

1. Authentication & Authorization:
   - `401 Unauthorized`
     - "No token provided"
     - "Token invalid/expired"
   - `403 Forbidden`
     - "Invalid token type"
     - "Account inactive"

2. Input Validation:
   - `400 Bad Request`
     - "VALIDATION_ERROR"
     - "MISSING_REQUIRED_FIELDS"
     - "INVALID_PASSWORD"

3. Conflicts:
   - `409 Conflict`
     - "DUPLICATE_ENTRY" (username/email sudah digunakan)

4. Rate Limiting:
   - `429 Too Many Requests`
     - "Rate limit exceeded"

5. Server Errors:
   - `500 Internal Server Error`
     - "INTERNAL_ERROR"

### Rate Limiting
- Default: 30 requests per minute per IP
- Password endpoint: 10 requests per minute per IP
- Headers diberikan untuk remaining requests dan reset time

## Notes
1. Semua timestamp menggunakan format ISO 8601
2. Response selalu menyertakan field `success` dan `message`
3. Data sensitif seperti password tidak pernah dikembalikan dalam response
4. Validasi input menggunakan Zod schema