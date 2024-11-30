// src/app/admin/quiz/[quizId]/results/[studentId]/_components/student-result-header.tsx

"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { QuizResponse } from "@/types/quiz";

interface StudentResultHeaderProps {
  quiz: QuizResponse;
  studentId: string;
}

export function StudentResultHeader({ quiz }: StudentResultHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">{quiz.data?.judul}</h1>
        <p className="text-muted-foreground">
          Penilaian jawaban quiz
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
      </div>
    </div>
  );
}