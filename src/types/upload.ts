// src/types/upload.ts

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

export const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
] as const;

export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];
export type AllowedVideoType = (typeof ALLOWED_VIDEO_TYPES)[number];

export const FILE_SIZE_LIMITS = {
  IMAGE: 5 * 1024 * 1024, // 5MB in bytes
  VIDEO: 100 * 1024 * 1024, // 100MB in bytes
} as const;

export interface FileValidationError {
  code: "FILE_TOO_LARGE" | "INVALID_FILE_TYPE";
  message: string;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: FileValidationError;
}

export interface ImageKitResponse {
  fileId: string;
  name: string;
  url: string;
  thumbnailUrl?: string;
  size: number;
}

export interface UploadConfig {
  folder?: string;
  fileName?: string;
  tags?: string[];
  useUniqueFileName?: boolean;
  isPrivateFile?: boolean;
  overwriteFile?: boolean;
  transformation?: {
    pre?: string;
    post?: string;
  };
}
