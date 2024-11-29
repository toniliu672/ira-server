# Quiz Admin API Documentation

## Overview
API ini digunakan untuk mengelola hasil quiz dan penilaian oleh admin. Semua endpoint memerlukan:
- Token admin dalam cookie (`admin-token`)
- CSRF token dalam header (`X-CSRF-Token`) untuk request POST
- Base URL: `/api/v1/quiz`

## Endpoints

### 1. List Quiz Results
Mendapatkan daftar hasil quiz dari semua siswa yang mengerjakan quiz tertentu.

```
GET /api/v1/quiz/{quizId}/results
```

#### Query Parameters
| Parameter  | Type    | Required | Description                                  |
|------------|---------|----------|----------------------------------------------|
| search     | string  | No       | Cari berdasarkan nama/username siswa        |
| status     | string  | No       | Filter status: "GRADED"/"UNGRADED" (essay) |
| page       | number  | No       | Halaman (default: 1)                        |
| limit      | number  | No       | Jumlah item per halaman (default: 10)       |
| sortBy     | string  | No       | Field untuk sorting (default: "fullName")    |
| sortOrder  | string  | No       | Urutan: "asc"/"desc" (default: "asc")       |

#### Response Success
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "student": {
          "id": "string",
          "username": "string",
          "name": "string"
        },
        "quiz": {
          "id": "string", 
          "title": "string",
          "type": "MULTIPLE_CHOICE | ESSAY"
        },
        "scores": {
          "answered": 5,
          "avgScore": 80,
          "isComplete": true
        },
        "submittedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "total": 20,
      "page": 1,
      "totalPages": 2
    }
  }
}
```

### 2. Get Student Quiz Result Detail
Melihat detail jawaban quiz seorang siswa.

```
GET /api/v1/quiz/{quizId}/results/{studentId}
```

#### Response Success
```json
{
  "success": true,
  "data": {
    "quiz": {
      "id": "string",
      "judul": "string",
      "type": "MULTIPLE_CHOICE | ESSAY"
    },
    "answers": [
      // Untuk Multiple Choice
      {
        "id": "string",
        "soalId": "string",
        "pertanyaan": "string",
        "jawaban": 0,
        "isCorrect": true,
        "nilai": 1
      },
      // Untuk Essay
      {
        "id": "string",
        "soalId": "string",
        "pertanyaan": "string",
        "jawaban": "string",
        "nilai": 80,
        "feedback": "string"
      }
    ]
  }
}
```

### 3. Grade Essay Answers
Memberikan nilai untuk jawaban essay.

```
POST /api/v1/quiz/{quizId}/essays/grade
```

#### Request Headers
```
X-CSRF-Token: <csrf_token>
```

#### Request Body
```json
{
  "answers": [
    {
      "jawabanId": "string",
      "nilai": 80,
      "feedback": "string" // Optional
    }
  ]
}
```

#### Response Success
```json
{
  "success": true,
  "message": "Penilaian berhasil disimpan",
  "data": {
    "updatedAnswers": [
      {
        "id": "string",
        "nilai": 80,
        "feedback": "string"
      }
    ]
  }
}
```

## Error Responses

Semua endpoint akan mengembalikan response error dengan format:

```json
{
  "success": false,
  "error": "Error message",
  "details": [] // Optional, untuk validation errors
}
```

### Common Error Codes
- 400: Bad Request (validation error)
- 401: Unauthorized (token tidak valid)
- 403: Forbidden (CSRF token tidak valid)
- 404: Not Found
- 500: Internal Server Error

## Notes
- Untuk quiz tipe Multiple Choice, nilai dihitung otomatis saat siswa submit jawaban
- Untuk quiz tipe Essay, admin perlu memberikan nilai manual (0-100)
- Status "GRADED"/"UNGRADED" hanya berlaku untuk quiz Essay
- Hasil quiz di-cache selama 60 detik untuk optimasi performa