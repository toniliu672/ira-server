# Mobile Learning Content API Documentation

## Authentication Requirements
Setiap request memerlukan:
- Header `Authorization: Bearer <token>`  
- Header `X-Device-ID: <deviceId>`

## Endpoints

### 1. Get Materi List
**Endpoint:** GET /api/v1/mobile/materi

**Query Parameters:**
- `search` (optional): string - Kata kunci pencarian
- `page` (optional): number - Halaman yang diminta (default: 1)
- `limit` (optional): number - Jumlah item per halaman (default: 10)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Successfully retrieved materi list",
  "data": {
    "materi": [
      {
        "id": "string",
        "judul": "string",
        "tujuanPembelajaran": ["string"],
        "capaianPembelajaran": ["string"],
        "deskripsi": "string",
        "thumbnailUrl": "string",
        "urutan": number,
        "status": true,
        "createdAt": "string",
        "updatedAt": "string"
      }
    ],
    "total": number,
    "page": number,
    "limit": number
  }
}
```

### 2. Get Single Materi Detail
**Endpoint:** GET /api/v1/mobile/materi/{materiId}

**Success Response (200):**
```json
{
  "success": true,
  "message": "Successfully retrieved materi detail",
  "data": {
    "id": "string",
    "judul": "string",
    "tujuanPembelajaran": ["string"],
    "capaianPembelajaran": ["string"],
    "deskripsi": "string",
    "thumbnailUrl": "string",
    "urutan": number,
    "status": true,
    "subMateri": [
      {
        "id": "string",
        "judul": "string",
        "konten": "string",
        "imageUrls": ["string"],
        "urutan": number,
        "status": true
      }
    ],
    "videoMateri": [
      {
        "id": "string",
        "judul": "string",
        "deskripsi": "string",
        "videoUrl": "string",
        "thumbnailUrl": "string",
        "durasi": number,
        "urutan": number,
        "status": true
      }
    ],
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

### 3. Get Sub Materi List
**Endpoint:** GET /api/v1/mobile/materi/{materiId}/sub

**Query Parameters:**
- `search` (optional): string - Kata kunci pencarian

**Success Response (200):**
```json
{
  "success": true,
  "message": "Successfully retrieved sub materi list",
  "data": [
    {
      "id": "string",
      "judul": "string",
      "konten": "string",
      "imageUrls": ["string"],
      "urutan": number,
      "status": true,
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
}
```

### 4. Get Single Sub Materi Detail
**Endpoint:** GET /api/v1/mobile/materi/{materiId}/sub/{subId}

**Success Response (200):**
```json
{
  "success": true,
  "message": "Successfully retrieved sub materi detail",
  "data": {
    "id": "string",
    "judul": "string",
    "konten": "string", 
    "imageUrls": ["string"],
    "urutan": number,
    "status": true,
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

### 5. Get Video Materi List
**Endpoint:** GET /api/v1/mobile/materi/{materiId}/video

**Query Parameters:**
- `search` (optional): string - Kata kunci pencarian

**Success Response (200):**
```json
{
  "success": true,
  "message": "Successfully retrieved video materi list",
  "data": [
    {
      "id": "string",
      "judul": "string",
      "deskripsi": "string",
      "videoUrl": "string",
      "thumbnailUrl": "string",
      "durasi": number,
      "urutan": number,
      "status": true,
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
}
```

### 6. Get Single Video Materi Detail
**Endpoint:** GET /api/v1/mobile/materi/{materiId}/video/{videoId}

**Success Response (200):**
```json
{
  "success": true,
  "message": "Successfully retrieved video materi detail",
  "data": {
    "id": "string",
    "judul": "string",
    "deskripsi": "string",
    "videoUrl": "string",
    "thumbnailUrl": "string", 
    "durasi": number,
    "urutan": number,
    "status": true,
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

## Error Responses

Semua error responses menggunakan format:
```json
{
  "success": false,
  "message": "Error message",
  "error": "ERROR_CODE"
}
```

**Status Codes:**
- `401` - Token tidak valid atau tidak ditemukan
- `403` - Invalid token type
- `404` - Data tidak ditemukan
- `429` - Rate limit exceeded
- `500` - Internal server error

## Additional Notes

1. Autentikasi menggunakan JWT token di header Authorization
2. Semua endpoint memerlukan Device ID di header
3. Semua data yang dikembalikan hanya yang status=true
4. Urutan data didasarkan pada field 'urutan' secara ascending
5. Rate limit: 30 request per menit per IP