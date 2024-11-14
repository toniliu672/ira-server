# Mobile API Documentation
## Server URL
```
https://ira-server-yipf.vercel.app
```
## Base URL
```
/api/v1/mobile
```

## Authentication
- Use Bearer token for authenticated requests
- Required headers:
  ```
  Authorization: Bearer <access_token>
  X-Device-ID: <unique-device-id>
  Content-Type: application/json
  ```

## Standard Response Format
```json
{
  "success": true|false,
  "message": "Message description",
  "data": {}, // Optional response data
  "error": "ERROR_CODE" // Only on error
}
```

## Endpoints

### 1. Register
```http
POST /users

Body:
{
  "username": "user123",
  "email": "user@example.com",
  "password": "password123",
  "fullName": "User Name",
  "gender": "MALE"|"FEMALE",
  "phone": "+1234567890", // optional
  "address": "User address" // optional
}
```

### 2. Login
```http
POST /auth/login

Body:
{
  "username": "user123",
  "password": "password123"
}

Response:
{
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token",
  "user": {
    "id": "user_id",
    "username": "user123",
    "fullName": "User Name",
    "email": "user@example.com",
    "gender": "MALE",
    "activeStatus": true
  }
}
```

### 3. Refresh Token
```http
POST /auth/refresh

Body:
{
  "refreshToken": "refresh_token"
}
```

### 4. Logout
```http
POST /auth/logout
// No body required, uses Authorization header
```

### 5. User Profile
```http
GET /users/me
PATCH /users/me // For updates

Update Body:
{
  "fullName": "New Name",
  "phone": "new_phone",
  "address": "new_address"
}
```

### 6. Password Update
```http
PUT /users/me/password

Body:
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

## Important Notes

1. Rate Limits:
   - Login: 5 requests/5 minutes
   - Registration: 10 requests/hour
   - Other endpoints: 60 requests/minute

2. Device Management:
   - Maximum 5 active devices per user
   - Each device needs unique deviceId in X-Device-ID header

3. Password Requirements:
   - Minimum 8 characters

4. Error Handling:
   - Check success flag in response
   - Error messages are in message field
   - Error codes provided in error field
   - HTTP status codes follow standard conventions (200, 400, 401, 403, 500)