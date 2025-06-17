// src/types/quiz.ts

import { z } from "zod";

// Base schemas
export const quizSchema = z.object({
  id: z.string().optional(),
  materiId: z.string(),
  judul: z.string().min(3, "Judul minimal 3 karakter"),
  deskripsi: z.string().optional().nullable(),
  type: z.enum(["MULTIPLE_CHOICE", "ESSAY"]),
  status: z.boolean().default(true),
});

export const soalPgSchema = z.object({
  id: z.string().optional(),
  quizId: z.string(),
  pertanyaan: z.string().min(5, "Pertanyaan minimal 5 karakter"),
  opsiJawaban: z.array(z.string()).min(2, "Minimal 2 pilihan jawaban"),
  kunciJawaban: z.number().min(0).max(3, "Index jawaban harus 0-3"),
  status: z.boolean().default(true),
});

export const soalEssaySchema = z.object({
  id: z.string().optional(),
  quizId: z.string(),
  pertanyaan: z.string().min(5, "Pertanyaan minimal 5 karakter"),
  status: z.boolean().default(true),
});

export const jawabanPgSchema = z.object({
  id: z.string().optional(),
  studentId: z.string(),
  soalId: z.string(),
  jawaban: z.number().min(0).max(3, "Index jawaban harus 0-3"),
  isCorrect: z.boolean(),
  nilai: z.number().min(0).max(1),
});

export const jawabanEssaySchema = z.object({
  id: z.string().optional(),
  studentId: z.string(),
  soalId: z.string(),
  jawaban: z.string().min(1, "Jawaban tidak boleh kosong"),
  nilai: z.number().min(0).max(100).optional().nullable(),
  feedback: z.string().optional().nullable(),
});

// Types derived from schemas
export type Quiz = z.infer<typeof quizSchema>;
export type SoalPg = z.infer<typeof soalPgSchema>;
export type SoalEssay = z.infer<typeof soalEssaySchema>;
export type JawabanPg = z.infer<typeof jawabanPgSchema>;
export type JawabanEssay = z.infer<typeof jawabanEssaySchema>;

// Response types
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

// Filter types
export type SortField = "judul" | "type" | "status";
export type SortOrder = "asc" | "desc";

export interface QuizFilters {
  search: string;
  type?: "MULTIPLE_CHOICE" | "ESSAY";
  materiId?: string;
  sortBy: SortField;
  sortOrder: SortOrder;
  status?: boolean;
  page?: number;
  limit?: number;
}

// Stats interface
export interface QuizStats {
  total: number;
  multipleChoice: number;
  essay: number;
  active: number;
}

// Quiz result
export interface QuizResult {
  student: {
    id: string;
    username: string;
    name: string;
  };
  quiz: {
    id: string;
    title: string;
    type: "MULTIPLE_CHOICE" | "ESSAY";
  };
  scores: {
    answered: number;
    avgScore: number;
    latestScore: number;
    isComplete: boolean;
  };
  submittedAt: string;
}

export interface QuizResultsResponse {
  success: boolean;
  data: {
    results: QuizResult[];
    pagination: {
      total: number;
      page: number;
      totalPages: number;
    };
  };
}
