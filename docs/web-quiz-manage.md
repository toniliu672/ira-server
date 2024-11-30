# Quiz Assessment API Documentation

## Base URL & Authentication
- Base URL: `/api/v1/quiz`
- Required Headers:
  - Cookie: `admin-token` (JWT token)
  - X-CSRF-Token: `<csrf_token>` (untuk request mutasi)

## Quiz Results & Assessment Endpoints

### List Quiz Results
```http
GET /api/v1/quiz/{quizId}/results
```
Query Parameters:
- search (string, optional): Search by student name/username
- status (string, optional): "GRADED" | "UNGRADED" (for essay only)
- page (number, optional): Page number, default 1
- limit (number, optional): Items per page, default 10
- sortBy (string, optional): Default "fullName"
- sortOrder (string, optional): "asc" | "desc", default "asc"

Response:
```json
{
  "success": true,
  "data": {
    "results": [{
      "student": {
        "id": "string",
        "username": "string",
        "name": "string"
      },
      "quiz": {
        "id": "string",
        "title": "string",
        "type": "MULTIPLE_CHOICE" | "ESSAY"
      },
      "scores": {
        "answered": 0,
        "avgScore": 0,
        "isComplete": true
      },
      "submittedAt": "string"
    }],
    "pagination": {
      "total": 0,
      "page": 1,
      "totalPages": 1
    }
  }
}
```

### Get Student Quiz Results
```http
GET /api/v1/quiz/{quizId}/results/{studentId}
```

Response:
```json
{
  "success": true,
  "data": {
    "quiz": {
      "id": "string",
      "judul": "string",
      "type": "MULTIPLE_CHOICE" | "ESSAY"
    },
    "answers": [{
      "id": "string",
      "soalRef": {
        "pertanyaan": "string",
        "quizId": "string"
      },
      "jawaban": "string", // For essay
      "nilai": 0, // 0-100 for essay, 0-1 for PG
      "feedback": "string", // For essay only
      "isCorrect": true // For PG only
    }]
  }
}
```

### Grade Essay Answer
```http
POST /api/v1/quiz/{quizId}/results/{studentId}/grade/{answerId}
```
Request Body:
```json
{
  "nilai": 0, // 0-100
  "feedback": "string" // Optional
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "string",
    "nilai": 0,
    "feedback": "string"
  },
  "message": "Nilai berhasil disimpan"
}
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
- PG answers are auto-graded (0-1)
- Essay answers need manual grading (0-100)
- Results are cached for 60 seconds
- All mutations require valid CSRF token
- Essay answers can have optional feedback
- Average scores are automatically calculated after grading