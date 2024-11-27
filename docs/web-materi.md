# Admin Content Management API

## Materi Endpoints

### List Materi
```
GET /api/v1/materi
Query: ?search=string&page=1&limit=10&sortBy=urutan&sortOrder=asc
```

### Get Single Materi
```
GET /api/v1/materi/{materiId}
```

### Create Materi
```
POST /api/v1/materi

Input:
{
  "judul": "string",
  "tujuanPembelajaran": ["string"],
  "capaianPembelajaran": ["string"],
  "deskripsi": "string",
  "thumbnailUrl": "string",
  "urutan": number,
  "status": boolean
}

Response:
{
  "success": true,
  "data": {
    "id": "string",
    "judul": "string",
    "tujuanPembelajaran": ["string"],
    "capaianPembelajaran": ["string"],
    "deskripsi": "string",
    "thumbnailUrl": "string",
    "urutan": number,
    "status": boolean
  }
}
```

### Update Materi
```
PATCH /api/v1/materi/{materiId}

Input: (semua field optional)
{
  "judul": "string",
  "tujuanPembelajaran": ["string"],
  "capaianPembelajaran": ["string"],
  "deskripsi": "string",
  "thumbnailUrl": "string",
  "urutan": number,
  "status": boolean
}
```

### Delete Materi
```
DELETE /api/v1/materi/{materiId}
```

## Sub Materi Endpoints

### List Sub Materi
```
GET /api/v1/materi/{materiId}/sub
Query: ?search=string&status=boolean
```

### Create Sub Materi
```
POST /api/v1/materi/{materiId}/sub

Input:
{
  "judul": "string",
  "konten": "string",
  "imageUrls": ["string"],
  "status": boolean
}

Response:
{
  "success": true,
  "data": {
    "id": "string",
    "judul": "string",
    "konten": "string",
    "imageUrls": ["string"],
    "urutan": number,
    "status": boolean,
    "materiId": "string"
  }
}
```

### Update Sub Materi
```
PATCH /api/v1/materi/{materiId}/sub/{subId}

Input: (semua field optional)
{
  "judul": "string",
  "konten": "string",
  "imageUrls": ["string"],
  "status": boolean
}
```

### Delete Sub Materi
```
DELETE /api/v1/materi/{materiId}/sub/{subId}
```

### Reorder Sub Materi
```
PATCH /api/v1/materi/{materiId}/sub/reorder

Input:
{
  "orderedIds": ["subMateriId1", "subMateriId2", "subMateriId3"]
}
```

## Video Materi Endpoints

### List Video Materi
```
GET /api/v1/materi/{materiId}/video
Query: ?search=string&status=boolean
```

### Create Video Materi
```
POST /api/v1/materi/{materiId}/video
Content-Type: multipart/form-data

Form Data:
- video: File
- thumbnail: File (optional)
- data: {
    "judul": "string",
    "deskripsi": "string",
    "durasi": number
  }

Response:
{
  "success": true,
  "data": {
    "id": "string",
    "judul": "string",
    "deskripsi": "string",
    "videoUrl": "string",
    "thumbnailUrl": "string",
    "durasi": number,
    "urutan": number,
    "status": boolean,
    "materiId": "string"
  }
}
```

### Update Video Materi
```
PATCH /api/v1/materi/{materiId}/video/{videoId}
Content-Type: multipart/form-data

Form Data:
- video: File (optional)
- thumbnail: File (optional)
- data: {
    "judul": "string",
    "deskripsi": "string",
    "durasi": number,
    "status": boolean
  }
```

### Delete Video Materi
```
DELETE /api/v1/materi/{materiId}/video/{videoId}
```

### Reorder Video Materi
```
PATCH /api/v1/materi/{materiId}/video/reorder

Input:
{
  "orderedIds": ["videoId1", "videoId2", "videoId3"]
}
```

## General Notes
- Semua request memerlukan token admin dalam cookie (`admin-token`)
- Semua request mutasi (POST/PATCH/DELETE) memerlukan CSRF token dalam header `X-CSRF-Token`