# Quiz Management API

## Quiz Endpoints

### List Quiz
```
GET /api/v1/quiz
Query: ?search=string&type=MULTIPLE_CHOICE|ESSAY&materiId=string&page=1&limit=10&sortBy=judul&sortOrder=asc&status=boolean
```

### Get Single Quiz
```
GET /api/v1/quiz/{quizId}
```

### Create Quiz
```
POST /api/v1/quiz

Input:
{
  "judul": "string",
  "deskripsi": "string",
  "type": "MULTIPLE_CHOICE" | "ESSAY",
  "status": boolean,
  "materiId": "string"
}

Response:
{
  "success": true,
  "data": {
    "id": "string",
    "judul": "string",
    "deskripsi": "string",
    "type": "MULTIPLE_CHOICE" | "ESSAY",
    "status": boolean,
    "materiId": "string"
  }
}
```

### Update Quiz
```
PATCH /api/v1/quiz/{quizId}

Input: (semua field optional)
{
  "judul": "string",
  "deskripsi": "string",
  "status": boolean
}
```

### Delete Quiz
```
DELETE /api/v1/quiz/{quizId}
```

## Soal PG (Multiple Choice) Endpoints

### List Soal PG
```
GET /api/v1/quiz/{quizId}/soal-pg
Query: ?status=boolean
```

### Create Soal PG
```
POST /api/v1/quiz/{quizId}/soal-pg

Input:
{
  "pertanyaan": "string",
  "opsiJawaban": ["string"],
  "kunciJawaban": number,
  "status": boolean
}

Response:
{
  "success": true,
  "data": {
    "id": "string",
    "pertanyaan": "string",
    "opsiJawaban": ["string"],
    "kunciJawaban": number,
    "status": boolean,
    "quizId": "string"
  }
}
```

### Update Soal PG
```
PATCH /api/v1/quiz/{quizId}/soal-pg/{soalId}

Input: (semua field optional)
{
  "pertanyaan": "string",
  "opsiJawaban": ["string"],
  "kunciJawaban": number,
  "status": boolean
}
```

### Delete Soal PG
```
DELETE /api/v1/quiz/{quizId}/soal-pg/{soalId}
```

## Soal Essay Endpoints

### List Soal Essay
```
GET /api/v1/quiz/{quizId}/soal-essay
Query: ?status=boolean
```

### Create Soal Essay
```
POST /api/v1/quiz/{quizId}/soal-essay

Input:
{
  "pertanyaan": "string",
  "status": boolean
}

Response:
{
  "success": true,
  "data": {
    "id": "string",
    "pertanyaan": "string",
    "status": boolean,
    "quizId": "string"
  }
}
```

### Update Soal Essay
```
PATCH /api/v1/quiz/{quizId}/soal-essay/{soalId}

Input: (semua field optional)
{
  "pertanyaan": "string",
  "status": boolean
}
```

### Delete Soal Essay
```
DELETE /api/v1/quiz/{quizId}/soal-essay/{soalId}
```

## Response Formats

### Success Response Format
```json
{
  "success": true,
  "data": {},
  "message": "string"
}
```

### Error Response Format
```json
{
  "success": false,
  "error": "string",
  "details": [] // For validation errors
}
```

## Notes
- Semua request memerlukan token admin dalam cookie (`admin-token`)
- Semua request mutasi (POST/PATCH/DELETE) memerlukan CSRF token dalam header `X-CSRF-Token`
- Field `type` pada quiz tidak bisa diubah setelah dibuat
- `kunciJawaban` pada soal PG adalah index dari array `opsiJawaban` (0-based)
- Soal PG hanya bisa dibuat untuk quiz dengan type `MULTIPLE_CHOICE`
- Soal Essay hanya bisa dibuat untuk quiz dengan type `ESSAY`
- Penghapusan quiz akan menghapus semua soal yang terkait