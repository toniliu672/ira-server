// src/types/admin.ts

import { z } from "zod";

export const adminSchema = z.object({
  id: z.string().optional(),
  username: z.string()
    .min(3, "Username minimal 3 karakter")
    .max(20, "Username maksimal 20 karakter")
    .regex(/^[a-zA-Z0-9_]+$/, "Username hanya boleh berisi huruf, angka dan underscore"),
  name: z.string()
    .min(2, "Nama minimal 2 karakter")
    .max(50, "Nama maksimal 50 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string()
    .min(8, "Password minimal 8 karakter")
    .regex(/[A-Z]/, "Password harus mengandung huruf kapital")
    .regex(/[a-z]/, "Password harus mengandung huruf kecil")
    .regex(/[0-9]/, "Password harus mengandung angka")
    .regex(/[^A-Za-z0-9]/, "Password harus mengandung karakter special")
    .optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export const adminUpdateSchema = adminSchema.partial();

export type SortField = "username" | "name" | "email" | "createdAt";
export type SortOrder = "asc" | "desc";

// Export tipe dari schema
export type AdminCreate = z.input<typeof adminSchema>;
export type AdminUpdate = z.input<typeof adminUpdateSchema>;
export type AdminResponse = z.output<typeof adminSchema>;

export interface AdminFilters {
  search: string;
  sortBy: SortField;
  sortOrder: SortOrder;
  page?: number;
  limit?: number;
}

export interface AdminResponseData {
  success: boolean;
  message?: string;
  data?: AdminResponse;
  error?: string;
}

export interface AdminListResponse {
  success: boolean;
  message?: string;
  data?: {
    admins: AdminResponse[];
    total: number;
    page: number;
    limit: number;
  };
  error?: string;
}