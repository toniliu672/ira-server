// src/types/user.ts

import { z } from "zod";

export const userSchema = z.object({
  id: z.string().optional(),
  username: z.string()
    .min(3, "Username minimal 3 karakter")
    .max(20, "Username maksimal 20 karakter")
    .regex(/^[a-zA-Z0-9_]+$/, "Username hanya boleh berisi huruf, angka dan underscore"),
  email: z.string().email("Format email tidak valid"),
  password: z.string()
    .min(8, "Password minimal 8 karakter")
    .regex(/[A-Z]/, "Password harus mengandung huruf kapital")
    .regex(/[a-z]/, "Password harus mengandung huruf kecil")
    .regex(/[0-9]/, "Password harus mengandung angka")
    .regex(/[^A-Za-z0-9]/, "Password harus mengandung karakter special")
    .optional(),
  fullName: z.string()
    .min(2, "Nama lengkap minimal 2 karakter")
    .max(100, "Nama lengkap maksimal 100 karakter"),
  gender: z.enum(["MALE", "FEMALE"]),
  dateOfBirth: z.date().optional().nullable(),
  phone: z.string()
    .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, "Format nomor telepon tidak valid")
    .optional()
    .nullable(),
  address: z.string().max(255, "Alamat maksimal 255 karakter").optional().nullable(),
  activeStatus: z.boolean().default(true),
  deviceId: z.string().optional().nullable(),
  lastLogin: z.date().optional().nullable(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export const userUpdateSchema = userSchema.partial();

export type SortField = "username" | "fullName" | "email" | "createdAt" | "lastLogin" | "activeStatus";
export type SortOrder = "asc" | "desc";

export type UserCreate = z.input<typeof userSchema>;
export type UserUpdate = z.input<typeof userUpdateSchema>;
export type UserResponse = z.output<typeof userSchema>;

export interface UserFilters {
  search: string;
  sortBy: SortField;
  sortOrder: SortOrder;
  activeOnly?: boolean;
  page?: number;
  limit?: number;
}

export interface UserResponseData {
  success: boolean;
  message?: string;
  data?: UserResponse;
  error?: string;
}

export interface UserListResponse {
  success: boolean;
  message?: string;
  data?: {
    users: UserResponse[];
    total: number;
    page: number;
    limit: number;
  };
  error?: string;
}

export interface UserDevice {
    id: string;
    deviceId: string;
    lastLogin: Date;
    deviceInfo?: string;
  }