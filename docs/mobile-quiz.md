# Mobile Quiz API Documentation

## Authentication
Semua endpoint memerlukan:
- Bearer token di header `Authorization`
- Device ID di header `X-Device-ID` 

## Endpoints

### Get Quiz List
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

### Get Quiz Detail
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

### Submit Quiz Answers
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

### Get Quiz Results
**Endpoint:** GET /api/v1/mobile/quiz/results

**Description:** Mendapatkan hasil quiz siswa.

**Headers:**
```
Authorization: Bearer <token>
X-Device-ID: <deviceId>
```

**Query Parameters:**
```
materiId: string (optional) - Filter berdasarkan materi
type: "MULTIPLE_CHOICE" | "ESSAY" (optional) - Filter berdasarkan tipe quiz
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
      "materiId": "string",
      "materiTitle": "string",
      "avgScore": number,
      "totalQuestions": number,
      "answeredQuestions": number
    }
  ]
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
4. Quiz results bisa difilter berdasarkan materi dan tipe quiz
5. Satu soal hanya bisa dijawab sekali per siswa
6. Device ID wajib disertakan di setiap request sebagai bagian dari autentikasi