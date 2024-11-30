// src/app/admin/quiz/[quizId]/results/[studentId]/page.tsx

import { Metadata } from "next";
import { getQuizById } from "@/services/quizService";
import { StudentResultHeader } from "./_components/student-result-header";
import { StudentAnswers } from "./_components/student-answers";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface StudentResultPageProps {
  params: Promise<{ quizId: string; studentId: string }>;
}

export async function generateMetadata({ params }: StudentResultPageProps): Promise<Metadata> {
  const { quizId } = await params;
  const quiz = await getQuizById(quizId);
  
  return {
    title: `Penilaian Quiz - ${quiz.judul}`,
    description: `Penilaian hasil quiz ${quiz.judul}`
  };
}

export default async function StudentResultPage({ params }: StudentResultPageProps) {
  const { quizId, studentId } = await params;
  const quiz = await getQuizById(quizId);
  
  // Add success property to match QuizResponse type
  const quizWithSuccess = {
    ...quiz,
    success: true
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <StudentResultHeader quiz={quizWithSuccess} studentId={studentId} />
      
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold tracking-tight">Detail Jawaban</h2>
          <p className="text-muted-foreground">
            {quiz.type === "ESSAY" ? 
              "Berikan penilaian untuk setiap jawaban essay" :
              "Lihat detail jawaban pilihan ganda"
            }
          </p>
        </CardHeader>
        <CardContent>
          <StudentAnswers 
            quizId={quizId} 
            studentId={studentId} 
            quizType={quiz.type}
          />
        </CardContent>
      </Card>
    </div>
  );
}