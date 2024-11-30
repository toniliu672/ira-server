# Mobile Quiz API Documentation

## Authentication
Semua endpoint memerlukan:
- Bearer token di header `Authorization`
- Device ID di header `X-Device-ID` 

## Quiz Endpoints

### 1. Get Quiz List
**Endpoint:** GET /api/v1/mobile/quiz

**Headers:**
```
Authorization: Bearer <token>
X-Device-ID: <deviceId>
```

**Query Parameters:**
```
materiId: string (required) - ID materi yang diminta
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "judul": "string",
      "deskripsi": "string",
      "type": "MULTIPLE_CHOICE" | "ESSAY",
      "status": true,
      "materiId": "string"
    }
  ]
}
```

### 2. Get Quiz Detail with Questions
**Endpoint:** GET /api/v1/mobile/quiz/{quizId}

**Headers:**
```
Authorization: Bearer <token>
X-Device-ID: <deviceId>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "quiz": {
      "id": "string",
      "judul": "string", 
      "deskripsi": "string",
      "type": "MULTIPLE_CHOICE" | "ESSAY",
      "status": true,
      "materiId": "string"
    },
    "questions": [
      // For Multiple Choice:
      {
        "id": "string",
        "pertanyaan": "string",
        "opsiJawaban": ["string"],
        "status": true
      }
      // OR for Essay:
      {
        "id": "string",
        "pertanyaan": "string",
        "status": true
      }
    ]
  }
}
```

### 3. Submit Quiz Answers
**Endpoint:** POST /api/v1/mobile/quiz/{quizId}/answers

**Headers:**
```
Authorization: Bearer <token>
X-Device-ID: <deviceId>
```

**Request Body for Multiple Choice:**
```json
{
  "answers": [
    {
      "soalId": "string",
      "jawaban": number // 0-3
    }
  ]
}
```

**Request Body for Essay:**
```json
{
  "soalId": "string",
  "jawaban": "string"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    // For Multiple Choice:
    "submitted": number,
    "failed": number,
    "avgScore": number,
    
    // OR for Essay:
    "id": "string",
    "status": "PENDING_REVIEW"
  },
  "message": "string"
}
```

### 4. Get User's Quiz Results
**Endpoint:** GET /api/v1/mobile/quiz/scores/user

**Headers:**
```
Authorization: Bearer <token>
X-Device-ID: <deviceId>
```

**Query Parameters:**
```
materiId: string (optional) - Filter hasil quiz berdasarkan materi
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "scores": [
      {
        "quizId": "string",
        "title": "string",
        "type": "MULTIPLE_CHOICE" | "ESSAY",
        "materiId": "string",
        "score": number, // 0-100
        "totalAnswered": number
      }
    ]
  }
}
```

### 5. Get Quiz Results List
**Endpoint:** GET /api/v1/mobile/quiz/results

**Headers:**
```
Authorization: Bearer <token>
X-Device-ID: <deviceId>
```

**Query Parameters:**
```
materiId: string (required) - ID materi
type: "MULTIPLE_CHOICE" | "ESSAY" (optional)
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "quizId": "string",
      "quizTitle": "string",
      "type": "MULTIPLE_CHOICE" | "ESSAY",
      "score": number,
      "progress": {
        "completed": number,
        "isComplete": boolean,
        "lastSubmitted": "string"
      }
    }
  ]
}
```

### 6. Get Quiz Result Detail
**Endpoint:** GET /api/v1/mobile/quiz/{quizId}/details

**Headers:**
```
Authorization: Bearer <token>
X-Device-ID: <deviceId>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "quiz": {
      "id": "string",
      "judul": "string",
      "type": "MULTIPLE_CHOICE" | "ESSAY",
      "materiId": "string"
    },
    "answers": [
      {
        "id": "string",
        "soalRef": {
          "pertanyaan": "string",
          "quizId": "string"
        },
        "jawaban": string | number,
        "nilai": number, // 0-1 for PG, 0-100 for Essay
        "feedback": string, // Only for essay
        "isCorrect": boolean // Only for PG
      }
    ],
    "summary": {
      "totalAnswered": number,
      "avgScore": number,
      "isComplete": boolean
    }
  }
}
```

### 7. Get Quiz Rankings
**Endpoint:** GET /api/v1/mobile/quiz/{quizId}/scores

**Headers:**
```
Authorization: Bearer <token>
X-Device-ID: <deviceId>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "rankings": [
      {
        "rank": number,
        "username": "string",
        "name": "string",
        "score": number, // 0-100
        "lastSubmitted": string, // ISO date string
        "isYou": boolean
      }
    ],
    "user": {
      "rank": number,
      "score": number
    }
  }
}
```

## Error Responses
Semua endpoint mengembalikan format error yang sama:

```json
{
  "success": false,
  "error": "Error message",
  "details": [] // Optional, untuk validation errors
}
```

**Status Codes:**
- `400` - Bad Request / Validation Error
- `401` - Unauthorized (token tidak valid/device ID tidak ada)
- `403` - Forbidden
- `404` - Not Found 
- `409` - Conflict (jawaban sudah ada)
- `500` - Internal Server Error

## Notes
1. Semua endpoint memerlukan valid token dan device ID
2. Token berisi studentId yang digunakan untuk filter data
3. PG dinilai otomatis (0-1 dikonversi ke 0-100), Essay dinilai manual (0-100)
4. Rankings di-cache 5 menit
5. User scores di-cache 1 menit
6. Jawaban multiple choice menggunakan index 0-3
7. Satu soal hanya bisa dijawab sekali
8. Rankings menampilkan 100 teratas
9. Semua timestamp menggunakan ISO date string
10. Score selalu dalam skala 0-100 untuk kemudahan display