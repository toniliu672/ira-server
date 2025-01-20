// src/types/materi.ts

import { z } from "zod";

// Base schema untuk fields yang sama
const materiBaseSchema = z.object({
  judul: z.string().min(3, "Judul minimal 3 karakter"),
  tujuanPembelajaran: z
    .array(z.string())
    .min(1, "Minimal 1 tujuan pembelajaran"),
  capaianPembelajaran: z
    .array(z.string())
    .min(1, "Minimal 1 capaian pembelajaran"),
  deskripsi: z.string().optional().nullable(),
  thumbnailUrl: z.string().url("Format URL tidak valid").optional().nullable(),
  urutan: z.number().int().positive("Urutan harus positif"),
  status: z.boolean().default(true),
});

// Schema untuk create (tanpa id)
export const materiCreateSchema = materiBaseSchema;

// Schema untuk materi lengkap (dengan id)
export const materiSchema = materiBaseSchema.extend({
  id: z.string(),
});

export const subMateriSchema = z
  .object({
    id: z.string().optional(),
    judul: z.string().min(3, "Judul minimal 3 karakter"),
    konten: z.string().min(10, "Konten minimal 10 karakter"),
    imageUrls: z.array(z.string().url("Format URL tidak valid")).default([]),
    urutan: z.number().int().positive("Urutan harus positif"),
    status: z.boolean().default(true),
    materiId: z.string(),
  })
  .strict();

// Validasi URL YouTube yang lebih fleksibel
const youtubeUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;

export const videoMateriInputSchema = z.object({
  judul: z.string().min(1, "Judul wajib diisi"),
  deskripsi: z.string().nullable(),
  videoUrl: z.string()
    .min(1, "URL video wajib diisi")
    .regex(youtubeUrlPattern, "Format URL YouTube tidak valid"),
  youtubeId: z.string().optional(), // Akan diisi oleh server
  thumbnailUrl: z.string().nullable().optional(),
  durasi: z.number().min(1, "Durasi minimal 1 menit"),
  materiId: z.string().min(1, "MateriId wajib diisi"),
  urutan: z.number().optional(),
  status: z.boolean().optional()
});

export interface VideoMateri {
  id: string;
  judul: string;
  deskripsi: string | null;
  videoUrl: string;
  youtubeId: string;
  thumbnailUrl: string | null;
  durasi: number;
  urutan: number;
  status: boolean;
  materiId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Schema untuk database
export const videoMateriSchema = z.object({
  id: z.string().optional(),
  judul: z.string().min(3, "Judul minimal 3 karakter"),
  deskripsi: z.string().optional().nullable(),
  videoUrl: z.string().url("Format URL tidak valid"),
  thumbnailUrl: z.string().url("Format URL tidak valid").optional().nullable(),
  durasi: z.number().int().positive("Durasi harus positif"),
  urutan: z.number().int().positive("Urutan harus positif"),
  status: z.boolean().default(true),
  materiId: z.string(),
});

// Export types
export type MateriCreate = z.infer<typeof materiCreateSchema>;
export type Materi = z.infer<typeof materiSchema>;
export type SubMateri = z.infer<typeof subMateriSchema>;
export type VideoMateriInput = z.infer<typeof videoMateriInputSchema>;

export interface MateriResponse {
  success: boolean;
  message?: string;
  data?: Materi;
  error?: string;
}

export interface SubMateriResponse {
  success: boolean;
  message?: string;
  data?: SubMateri;
  error?: string;
}

export interface VideoMateriResponse {
  success: boolean;
  message?: string;
  data?: VideoMateri;
  error?: string;
}

export interface MateriListResponse {
  success: boolean;
  message?: string;
  data?: {
    materi: Materi[];
    total: number;
    page: number;
    limit: number;
  };
  error?: string;
}

export interface MateriStats {
  total: number;
  active: number;
  inactive: number;
}
