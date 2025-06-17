// src/app/admin/quiz/[quizId]/results/_components/quiz-results-table.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { QuizResultsFilter } from "./quiz-results-filter";
import { formatDate } from "@/lib/utils";
import type { QuizType } from "@prisma/client";
import type { QuizResult, QuizResultsResponse } from "@/types/quiz";

interface QuizResultsTableProps {
  quizId: string;
  quizType: QuizType;
}

export function QuizResultsTable({ quizId, quizType }: QuizResultsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResults = useCallback(async () => {
    try {
      const params = new URLSearchParams(searchParams);
      const response = await fetch(
        `/api/v1/quiz/${quizId}/results?${params.toString()}`
      );
      const data: QuizResultsResponse = await response.json();
      if (data.success) {
        setResults(data.data.results);
      }
    } catch (error) {
      console.error("Error fetching results:", error);
    } finally {
      setLoading(false);
    }
  }, [quizId, searchParams]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleViewDetail = (studentId: string) => {
    router.push(`/admin/quiz/${quizId}/results/${studentId}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <QuizResultsFilter isEssayQuiz={quizType === "ESSAY"} />
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Siswa</TableHead>
              <TableHead>Username</TableHead>
              <TableHead className="text-center">Jawaban</TableHead>
              <TableHead className="text-center">Nilai Rata-rata</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Tanggal Submit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result) => (
              <TableRow
                key={`${result.student.id}`}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleViewDetail(result.student.id)}
              >
                <TableCell className="font-medium">
                  {result.student.name}
                </TableCell>
                <TableCell>{result.student.username}</TableCell>
                <TableCell className="text-center">
                  {result.scores.answered}
                </TableCell>
                <TableCell className="text-center">
                  {result.scores.avgScore.toFixed(1)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge 
                    variant={result.scores.isComplete ? "default" : "secondary"}
                  >
                    {result.scores.isComplete ? "Selesai" : "Belum Selesai"}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  {formatDate(result.submittedAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}