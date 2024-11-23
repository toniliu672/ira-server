// src/utils/upload.ts

import type { FileValidationError } from '@/types/upload';
import { 
  ALLOWED_IMAGE_TYPES, 
  ALLOWED_VIDEO_TYPES, 
  FILE_SIZE_LIMITS 
} from '@/types/upload';

// Type guard function untuk mengecek apakah sebuah string termasuk dalam allowed types
function isAllowedImageType(type: string): type is typeof ALLOWED_IMAGE_TYPES[number] {
  return ALLOWED_IMAGE_TYPES.includes(type as typeof ALLOWED_IMAGE_TYPES[number]);
}

function isAllowedVideoType(type: string): type is typeof ALLOWED_VIDEO_TYPES[number] {
  return ALLOWED_VIDEO_TYPES.includes(type as typeof ALLOWED_VIDEO_TYPES[number]);
}

export async function validateFile(
  file: File,
  type: 'image' | 'video'
): Promise<FileValidationError | null> {
  // Validate file type
  if (type === 'image' && !isAllowedImageType(file.type)) {
    return {
      code: 'INVALID_FILE_TYPE',
      message: `File harus berformat ${ALLOWED_IMAGE_TYPES.join(', ')}`
    };
  }

  if (type === 'video' && !isAllowedVideoType(file.type)) {
    return {
      code: 'INVALID_FILE_TYPE',
      message: `File harus berformat ${ALLOWED_VIDEO_TYPES.join(', ')}`
    };
  }

  // Validate file size
  const maxSize = type === 'image' ? FILE_SIZE_LIMITS.IMAGE : FILE_SIZE_LIMITS.VIDEO;
  if (file.size > maxSize) {
    const sizeMB = maxSize / (1024 * 1024);
    return {
      code: 'FILE_TOO_LARGE',
      message: `Ukuran file maksimal ${sizeMB}MB`
    };
  }

  return null;
}

export async function compressImage(file: File): Promise<File> {
  // Implementasi kompresi gambar jika diperlukan
  // Bisa menggunakan library seperti browser-image-compression
  return file;
}

export function generateFileName(originalName: string, type: 'image' | 'video'): string {
  const timestamp = new Date().getTime();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop() || '';
  
  return `${type}_${timestamp}_${randomString}.${extension}`;
}