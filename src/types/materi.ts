// src/types/materi.ts

import { z } from "zod";
import type {
  Prisma,
  Materi as PrismaMateri,
  SubMateri as PrismaSubMateri,
} from "@prisma/client";

// Base Schema untuk SubMateri
export const subMateriSchema = z.object({
  judul: z.string().min(1, "Judul sub-materi wajib diisi"),
  materi: z.string().min(1, "Konten materi wajib diisi"),
  urutan: z.number().min(1, "Urutan wajib diisi"),
  status: z.boolean().default(true),
  createdBy: z.string(),
  updatedBy: z.string().optional(),
});

export const materiSchema = z.object({
  judul: z.string().min(1, "Judul materi wajib diisi"),
  tujuanPembelajaran: z
    .array(z.string())
    .min(1, "Minimal satu tujuan pembelajaran"),
  capaianPembelajaran: z
    .array(z.string())
    .min(1, "Minimal satu capaian pembelajaran"),
  deskripsi: z.string().optional(),
  urutan: z.number().min(1, "Urutan wajib diisi"),
  status: z.boolean().default(true),
  createdBy: z.string(),
  updatedBy: z.string().optional(),
});

// Input Schema untuk membuat Materi (tanpa createdBy, akan ditambahkan di service)
export const materiCreateSchema = materiSchema.omit({
  createdBy: true,
  updatedBy: true,
});

// Update schemas
export const materiUpdateSchema = materiSchema.partial().omit({
  createdBy: true,
});
export const subMateriUpdateSchema = subMateriSchema.partial();

// Prisma Types
export type MateriWithSubMateri = PrismaMateri & {
  subMateri: PrismaSubMateri[];
};

export type MateriCreateInput = Prisma.MateriCreateInput;
export type MateriUpdateInput = Prisma.MateriUpdateInput;
export type SubMateriCreateInput = Prisma.SubMateriCreateInput;
export type SubMateriUpdateInput = Prisma.SubMateriUpdateInput;

// Custom Types
export type SortField = "judul" | "urutan" | "createdAt" | "updatedAt";
export type SortOrder = "asc" | "desc";

export interface MateriFilters {
  search?: string;
  sortBy: SortField;
  sortOrder: SortOrder;
  status?: boolean;
  page?: number;
  limit?: number;
}

// Response Types
export interface MateriResponseData {
  success: boolean;
  message?: string;
  data?: MateriWithSubMateri;
  error?: string;
}

export interface MateriListResponse {
  success: boolean;
  message?: string;
  data?: {
    materi: MateriWithSubMateri[];
    total: number;
    page: number;
    limit: number;
  };
  error?: string;
}
