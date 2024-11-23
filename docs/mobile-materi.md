# Mobile Learning Content API Specification

## Get Materi List
**Endpoint:** GET /api/v1/mobile/materi  
**Description:** Mendapatkan daftar materi yang aktif dengan dukungan pagination dan pencarian

**Request Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:**
```
search: string (optional) - Kata kunci pencarian
page: number (optional, default: 1) - Halaman yang diminta
limit: number (optional, default: 10) - Jumlah item per halaman
```

**Success Response (200 OK):**
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

**Error Responses:**
- `401` - Token tidak valid atau tidak ditemukan
- `403` - Invalid token type
- `429` - Rate limit exceeded

## Get Materi Detail
**Endpoint:** GET /api/v1/mobile/materi/{materiId}  
**Description:** Mendapatkan detail materi beserta sub materi dan video materi yang aktif

**Request Headers:**
```
Authorization: Bearer <accessToken>
```

**Path Parameters:**
```
materiId: string (required) - ID materi yang diminta
```

**Success Response (200 OK):**
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

**Error Responses:**
- `401` - Token tidak valid atau tidak ditemukan
- `403` - Invalid token type
- `404` - Materi tidak ditemukan
- `429` - Rate limit exceeded

## Get Sub Materi List
**Endpoint:** GET /api/v1/mobile/materi/{materiId}/sub  
**Description:** Mendapatkan daftar sub materi yang aktif untuk materi tertentu

**Request Headers:**
```
Authorization: Bearer <accessToken>
```

**Path Parameters:**
```
materiId: string (required) - ID materi yang diminta
```

**Query Parameters:**
```
search: string (optional) - Kata kunci pencarian
```

**Success Response (200 OK):**
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

**Error Responses:**
- `401` - Token tidak valid atau tidak ditemukan
- `403` - Invalid token type
- `404` - Materi tidak ditemukan
- `429` - Rate limit exceeded

## Get Video Materi List
**Endpoint:** GET /api/v1/mobile/materi/{materiId}/video  
**Description:** Mendapatkan daftar video materi yang aktif untuk materi tertentu

**Request Headers:**
```
Authorization: Bearer <accessToken>
```

**Path Parameters:**
```
materiId: string (required) - ID materi yang diminta
```

**Query Parameters:**
```
search: string (optional) - Kata kunci pencarian
```

**Success Response (200 OK):**
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

**Error Responses:**
- `401` - Token tidak valid atau tidak ditemukan
- `403` - Invalid token type
- `404` - Materi tidak ditemukan
- `429` - Rate limit exceeded

## General Notes

1. **Authentication**
   - Semua endpoint memerlukan token JWT dalam header Authorization
   - Format header: `Authorization: Bearer <accessToken>`
   - Token harus memiliki role="user"

2. **Rate Limiting**
   - Setiap endpoint memiliki rate limit 30 request per menit per IP
   - Status 429 akan dikembalikan jika rate limit terlampaui

3. **Filtering**
   - Semua endpoint hanya mengembalikan data dengan status=true
   - Urutan data didasarkan pada field 'urutan' secara ascending

4. **Error Response Format**
```json
{
  "success": false,
  "message": "Error message",
  "error": "ERROR_CODE"
}
```