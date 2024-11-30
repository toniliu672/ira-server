/* eslint-disable react-hooks/exhaustive-deps */
// src/app/admin/quiz/[quizId]/results/[studentId]/_components/student-answers.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  const [loading, setLoading] = useState(false);

  // Fetch answers on mount
  useEffect(() => {
    fetchAnswers();
  }, [quizId, studentId]); // Added dependencies

  async function fetchAnswers() {
    try {
      const response = await fetch(
        `/api/v1/quiz/${quizId}/results/${studentId}`
      );
      const data = await response.json();
      if (data.success) {
        setAnswers(data.data.answers);
      }
    } catch (error) {
      console.error("Error fetching answers:", error);
    }
  }

  async function handleGrade(
    answerId: string,
    nilai: number,
    feedback?: string
  ) {
    setLoading(true);
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
      }
    } catch (error) {
      console.error("Error grading answer:", error);
    } finally {
      setLoading(false);
    }
  }

  if (!answers.length) {
    return <div>Loading answers...</div>;
  }

  return (
    <div className="space-y-6">
      {answers.map((answer) => (
        <Card key={answer.id}>
          <CardContent className="pt-6 space-y-4">
            <div>
              <Label>Pertanyaan</Label>
              <p className="mt-1">{answer.soalRef.pertanyaan}</p>
            </div>

            <div>
              <Label>Jawaban Siswa</Label>
              <p className="mt-1">{answer.jawaban}</p>
            </div>

            {quizType === "ESSAY" && (
              <>
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
                  disabled={loading}
                  onClick={() => {
                    const nilai = parseInt(
                      (
                        document.getElementById(
                          `nilai-${answer.id}`
                        ) as HTMLInputElement
                      ).value
                    );
                    const feedback = (
                      document.getElementById(
                        `feedback-${answer.id}`
                      ) as HTMLTextAreaElement
                    ).value;
                    handleGrade(answer.id, nilai, feedback);
                  }}
                >
                  {loading ? "Menyimpan..." : "Simpan Nilai"}
                </Button>
              </>
            )}

            {quizType === "MULTIPLE_CHOICE" && (
              <div>
                <Label>Nilai</Label>
                <p className="mt-1">
                  {answer.isCorrect ? "Benar (1)" : "Salah (0)"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
