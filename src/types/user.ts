// src/types/user.ts

import { z } from "zod";

export const userSchema = z.object({
  id: z.string().optional(),
  username: z.string().min(3, "Username minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter").optional(),
  fullName: z.string().min(2, "Nama lengkap minimal 2 karakter"),
  gender: z.enum(["MALE", "FEMALE"]),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  activeStatus: z.boolean().default(true),
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