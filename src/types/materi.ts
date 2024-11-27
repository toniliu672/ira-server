// src/types/materi.ts

import { z } from "zod";

export const materiSchema = z.object({
    id: z.string(),  // Ubah dari optional menjadi required
    judul: z.string().min(3, "Judul minimal 3 karakter"),
    tujuanPembelajaran: z.array(z.string()).min(1, "Minimal 1 tujuan pembelajaran"),
    capaianPembelajaran: z.array(z.string()).min(1, "Minimal 1 capaian pembelajaran"),
    deskripsi: z.string().optional().nullable(),
    thumbnailUrl: z.string().url("Format URL tidak valid").optional().nullable(),
    urutan: z.number().int().positive("Urutan harus positif"),
    status: z.boolean().default(true)
  });

  export const subMateriSchema = z.object({
    id: z.string().optional(),
    judul: z.string().min(3, "Judul minimal 3 karakter"),
    konten: z.string().min(10, "Konten minimal 10 karakter"),
    imageUrls: z.array(z.string().url("Format URL tidak valid")).default([]),
    urutan: z.number().int().positive("Urutan harus positif"),
    status: z.boolean().default(true),
    materiId: z.string()
  }).strict();

// Schema untuk input form
export const videoMateriInputSchema = z.object({
  judul: z.string().min(3, "Judul minimal 3 karakter"),
  deskripsi: z.string().optional().nullable(),
  durasi: z.number().int().positive("Durasi harus positif"),
  materiId: z.string()
});

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
  materiId: z.string()
});
export type Materi = z.infer<typeof materiSchema>;
export type SubMateri = z.infer<typeof subMateriSchema>;
export type VideoMateriInput = z.infer<typeof videoMateriInputSchema>;
export type VideoMateri = z.infer<typeof videoMateriSchema>;

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