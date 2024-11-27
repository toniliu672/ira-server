// src/types/quiz.ts

import { z } from "zod";

export const quizSchema = z.object({
  id: z.string().optional(),
  materiId: z.string(),
  judul: z.string().min(3, "Judul minimal 3 karakter"),
  deskripsi: z.string().optional().nullable(),
  type: z.enum(["MULTIPLE_CHOICE", "ESSAY"]),
  status: z.boolean().default(true)
});

export const soalPgSchema = z.object({
  id: z.string().optional(),
  quizId: z.string(),
  pertanyaan: z.string().min(5, "Pertanyaan minimal 5 karakter"),
  opsiJawaban: z.array(z.string()).min(2, "Minimal 2 opsi jawaban"),
  kunciJawaban: z.number().min(0).max(3),
  status: z.boolean().default(true)
});

export const soalEssaySchema = z.object({
  id: z.string().optional(),
  quizId: z.string(),
  pertanyaan: z.string().min(5, "Pertanyaan minimal 5 karakter"),
  status: z.boolean().default(true)
});

export const jawabanPgSchema = z.object({
  id: z.string().optional(),
  studentId: z.string(),
  soalId: z.string(),
  jawaban: z.number().min(0).max(3),
  isCorrect: z.boolean(),
  nilai: z.number()
});

export const jawabanEssaySchema = z.object({
  id: z.string().optional(),
  studentId: z.string(),
  soalId: z.string(),
  jawaban: z.string().min(10, "Jawaban minimal 10 karakter"),
  nilai: z.number().optional().nullable(),
  feedback: z.string().optional().nullable()
});

export type Quiz = z.infer<typeof quizSchema>;
export type SoalPg = z.infer<typeof soalPgSchema>;
export type SoalEssay = z.infer<typeof soalEssaySchema>;
export type JawabanPg = z.infer<typeof jawabanPgSchema>;
export type JawabanEssay = z.infer<typeof jawabanEssaySchema>;

export type SortField = "judul" | "type" | "status";
export type SortOrder = "asc" | "desc";

export interface QuizFilters {
  search?: string;
  materiId?: string;
  type?: "MULTIPLE_CHOICE" | "ESSAY";
  status?: boolean;
  page?: number;
  limit?: number;
  sortBy?: SortField;
  sortOrder?: SortOrder;
}

export interface QuizResponse {
  success: boolean;
  message?: string;
  data?: Quiz;
  error?: string;
}

export interface QuizListResponse {
  success: boolean;
  message?: string;
  data?: {
    quizzes: Quiz[];
    total: number;
    page: number;
    limit: number;
  };
  error?: string;
}

export interface SoalResponse {
  success: boolean;
  message?: string;
  data?: SoalPg | SoalEssay;
  error?: string;
}

export interface JawabanResponse {
  success: boolean;
  message?: string;
  data?: JawabanPg | JawabanEssay;
  error?: string;
}