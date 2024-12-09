// src/app/admin/quiz/[quizId]/results/[studentId]/_components/student-answers.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { getCSRFToken } from "@/lib/csrf";
import type { QuizType } from "@prisma/client";

interface StudentAnswersProps {
  quizId: string;
  studentId: string;
  quizType: QuizType;
}

export function StudentAnswers({
  quizId,
  studentId,
  quizType,
}: StudentAnswersProps) {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnswers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId, studentId]);

  async function fetchAnswers() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/v1/quiz/${quizId}/results/${studentId}`
      );
      const data = await response.json();
      if (data.success) {
        setAnswers(data.data.answers);
      } else {
        setError(data.error || "Failed to fetch answers");
      }
    } catch (error) {
      console.error("Error fetching answers:", error);
      setError("Failed to fetch answers. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGrade(
    answerId: string,
    nilai: number,
    feedback?: string
  ) {
    setSaving(answerId);
    setError(null);
    try {
      const response = await fetch(
        `/api/v1/quiz/${quizId}/results/${studentId}/grade/${answerId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": getCSRFToken(),
          },
          body: JSON.stringify({ nilai, feedback }),
        }
      );

      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to save grade");
      }
    } catch (error) {
      console.error("Error grading answer:", error);
      setError("Failed to save grade. Please try again.");
    } finally {
      setSaving(null);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function renderAnswerContent(answer: any) {
    if (quizType === "MULTIPLE_CHOICE") {
      const selectedAnswer = answer.soalRef.opsiJawaban[answer.jawaban];
      const correctAnswer = answer.soalRef.opsiJawaban[answer.soalRef.kunciJawaban];

      return (
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <Label className="text-sm text-muted-foreground">Jawaban Siswa</Label>
            <p className="mt-1 font-medium">
              Opsi {answer.jawaban + 1}: {selectedAnswer}
            </p>
          </div>

          {!answer.isCorrect && (
            <div className="bg-muted p-4 rounded-lg border-l-4 border-red-500">
              <Label className="text-sm text-muted-foreground">Jawaban Benar</Label>
              <p className="mt-1 font-medium">
                Opsi {answer.soalRef.kunciJawaban + 1}: {correctAnswer}
              </p>
            </div>
          )}

          <div>
            <Label>Nilai</Label>
            <p className="mt-1 font-medium">
              {answer.isCorrect ? "1 point" : "0 point"}
            </p>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="bg-muted p-4 rounded-lg">
          <Label className="text-sm text-muted-foreground">Jawaban Essay</Label>
          <p className="mt-1 whitespace-pre-wrap">{answer.jawaban}</p>
        </div>

        <div>
          <Label htmlFor={`nilai-${answer.id}`}>Nilai (0-100)</Label>
          <Input
            id={`nilai-${answer.id}`}
            type="number"
            min="0"
            max="100"
            defaultValue={answer.nilai || ""}
            className="w-32"
          />
        </div>

        <div>
          <Label htmlFor={`feedback-${answer.id}`}>Feedback</Label>
          <Textarea
            id={`feedback-${answer.id}`}
            defaultValue={answer.feedback || ""}
            placeholder="Berikan feedback untuk siswa"
          />
        </div>

        <Button
          disabled={saving === answer.id}
          onClick={() => {
            const nilai = parseInt(
              (document.getElementById(`nilai-${answer.id}`) as HTMLInputElement)
                .value
            );
            const feedback = (
              document.getElementById(
                `feedback-${answer.id}`
              ) as HTMLTextAreaElement
            ).value;
            handleGrade(answer.id, nilai, feedback);
          }}
        >
          {saving === answer.id ? "Menyimpan..." : "Simpan Nilai"}
        </Button>
      </>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((n) => (
          <Card key={n}>
            <CardContent className="pt-6 space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6">
        <p className="text-red-500">{error}</p>
        <Button 
          variant="outline" 
          onClick={fetchAnswers}
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!answers.length) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No answers submitted yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {answers.map((answer, index) => (
        <Card key={answer.id}>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">
                Soal {index + 1}
              </Label>
              {quizType === "MULTIPLE_CHOICE" && (
                <span className={`px-3 py-1 rounded-full text-sm ${
                  answer.isCorrect 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                }`}>
                  {answer.isCorrect ? "Benar" : "Salah"}
                </span>
              )}
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <Label className="text-sm text-muted-foreground">Pertanyaan</Label>
              <p className="mt-1 font-medium">{answer.soalRef.pertanyaan}</p>
            </div>

            {renderAnswerContent(answer)}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}