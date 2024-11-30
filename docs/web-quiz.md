# Quiz Management API Documentation

## Base URL & Authentication
- Base URL: `/api/v1/quiz`
- Required Headers:
  - Cookie: `admin-token` (JWT token)
  - X-CSRF-Token: `<csrf_token>` (untuk request mutasi)

## Quiz Management Endpoints

### List Quiz
```http
GET /api/v1/quiz
```
Query Parameters:
- search (string, optional): Filter by quiz title/description
- type (string, optional): "MULTIPLE_CHOICE" | "ESSAY"
- materiId (string, optional): Filter by materi ID
- page (number, optional): Page number, default 1
- limit (number, optional): Items per page, default 10
- sortBy (string, optional): "judul" | "type" | "status", default "judul"
- sortOrder (string, optional): "asc" | "desc", default "asc"
- status (boolean, optional): true | false, default true

Response:
```json
{
  "success": true,
  "data": {
    "quizzes": [{
      "id": "string",
      "judul": "string",
      "deskripsi": "string",
      "type": "MULTIPLE_CHOICE" | "ESSAY",
      "status": true,
      "materiId": "string",
      "_count": {
        "soalPg": 0,
        "soalEssay": 0
      }
    }],
    "total": 0,
    "stats": {
      "total": 0,
      "multipleChoice": 0,
      "essay": 0,
      "active": 0
    }
  }
}
```

### Get Single Quiz
```http
GET /api/v1/quiz/{quizId}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "string",
    "judul": "string",
    "deskripsi": "string",
    "type": "MULTIPLE_CHOICE" | "ESSAY",
    "status": true,
    "materiId": "string",
    "soalPg": [], // If type is MULTIPLE_CHOICE
    "soalEssay": [] // If type is ESSAY
  }
}
```

### Create Quiz
```http
POST /api/v1/quiz
```
Request Body:
```json
{
  "judul": "string",
  "deskripsi": "string",
  "type": "MULTIPLE_CHOICE" | "ESSAY",
  "materiId": "string",
  "status": true
}
```

### Update Quiz
```http
PATCH /api/v1/quiz/{quizId}
```
Request Body (all fields optional):
```json
{
  "judul": "string",
  "deskripsi": "string",
  "status": true
}
```

### Delete Quiz
```http
DELETE /api/v1/quiz/{quizId}
```

## Soal Management Endpoints

### List Soal PG
```http
GET /api/v1/quiz/{quizId}/soal-pg
Query: ?status=boolean
```

### Create Soal PG
```http
POST /api/v1/quiz/{quizId}/soal-pg
```
Request Body:
```json
{
  "pertanyaan": "string",
  "opsiJawaban": ["string"],
  "kunciJawaban": 0,
  "status": true
}
```

### Update Soal PG
```http
PATCH /api/v1/quiz/{quizId}/soal-pg/{soalId}
```
Request Body (all fields optional):
```json
{
  "pertanyaan": "string",
  "opsiJawaban": ["string"],
  "kunciJawaban": 0,
  "status": true
}
```

### Delete Soal PG
```http
DELETE /api/v1/quiz/{quizId}/soal-pg/{soalId}
```

### List Soal Essay
```http
GET /api/v1/quiz/{quizId}/soal-essay
Query: ?status=boolean
```

### Create Soal Essay
```http
POST /api/v1/quiz/{quizId}/soal-essay
```
Request Body:
```json
{
  "pertanyaan": "string",
  "status": true
}
```

### Update Soal Essay
```http
PATCH /api/v1/quiz/{quizId}/soal-essay/{soalId}
```
Request Body (all fields optional):
```json
{
  "pertanyaan": "string",
  "status": true
}
```

### Delete Soal Essay
```http
DELETE /api/v1/quiz/{quizId}/soal-essay/{soalId}
```

## Error Responses
All endpoints return error responses in format:
```json
{
  "success": false,
  "error": "Error message",
  "details": [] // Optional validation errors
}
```

Common Status Codes:
- 400: Bad Request / Validation Error
- 401: Unauthorized
- 403: Forbidden (CSRF)
- 404: Not Found
- 500: Internal Server Error

## Notes
- Quiz type (MULTIPLE_CHOICE/ESSAY) cannot be changed after creation
- All mutations require valid CSRF token
- Deleting a quiz will cascade delete all related soal
- Soal PG can only be created for MULTIPLE_CHOICE quiz
- Soal Essay can only be created for ESSAY quiz