# Mobile Quiz API Documentation

## Authentication
Semua endpoint memerlukan:
- Bearer token di header `Authorization`
- Device ID di header `X-Device-ID` 

## Endpoints

### 1. Get Quiz List
**Endpoint:** GET /api/v1/mobile/quiz

**Description:** Mendapatkan daftar quiz berdasarkan materi tertentu.

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

### 2. Get Quiz Detail
**Endpoint:** GET /api/v1/mobile/quiz/{quizId}

**Description:** Mendapatkan detail quiz beserta soal-soalnya.

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
      "type": "MULTIPLE_CHOICE" | "ESSAY"
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

**Description:** Mengirim jawaban quiz (PG atau Essay).

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
      "jawaban": number
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
    "results": [
      {
        "id": "string",
        "soalId": "string",
        "jawaban": number,
        "isCorrect": boolean,
        "nilai": number
      }
    ],
    "totalScore": number
    
    // OR for Essay:
    "id": "string",
    "soalId": "string",
    "jawaban": "string",
    "nilai": null
  },
  "message": "Jawaban berhasil disimpan"
}
```

### 4. Get Quiz Results List
**Endpoint:** GET /api/v1/mobile/quiz/results

**Description:** Mendapatkan daftar hasil semua quiz yang telah dikerjakan siswa.

**Headers:**
```
Authorization: Bearer <token>
X-Device-ID: <deviceId>
```

**Query Parameters:**
```
quizId: string (required) - ID quiz yang diminta
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "quiz": {
      "id": "string",
      "judul": "string",
      "type": "MULTIPLE_CHOICE" | "ESSAY"
    },
    "result": {
      "scores": {
        "answered": number,
        "avgScore": number,
        "isComplete": boolean
      },
      "submittedAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

### 5. Get Quiz Result Detail
**Endpoint:** GET /api/v1/mobile/quiz/{quizId}/details

**Description:** Mendapatkan detail hasil quiz tertentu beserta jawaban siswa.

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
        "pertanyaan": "string",
        "jawaban": "string" | number,
        "nilai": number,
        "feedback": "string", // Only for essay
        "isCorrect": boolean  // Only for multiple choice
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

## Error Responses
Semua endpoint mengembalikan format error yang sama:

```json
{
  "success": false,
  "error": "Error message"
}
```

**Status Codes:**
- `400` - Bad Request (format/parameter tidak valid)
- `401` - Unauthorized (token tidak valid/device ID tidak ada)  
- `404` - Not Found (quiz/soal tidak ditemukan)
- `500` - Internal Server Error

## Notes
1. Semua data yang dikembalikan hanya yang status=true
2. Multiple choice answers menggunakan index 0-based dari array opsiJawaban
3. Hasil essay tidak langsung memiliki nilai (null) sampai dinilai oleh admin
4. Satu soal hanya bisa dijawab sekali per siswa
5. Device ID wajib disertakan di setiap request
6. Token berisi informasi studentId yang digunakan untuk filter data
7. Quiz type menentukan format jawaban dan response yang dikembalikan
8. Untuk quiz PG, nilai dihitung otomatis
9. Untuk quiz Essay, feedback opsional dan hanya ada setelah dinilai