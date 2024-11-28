// src/app/admin/quiz/[quizId]/page.tsx

import { Metadata } from "next";
import { getQuizById } from "@/services/quizService";
import { SoalPgTable } from "./_components/soal-pg-table";
import { SoalEssayTable } from "./_components/soal-essay-table";
import { SoalHeader } from "./_components/soal-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface QuizSoalPageProps {
  params: Promise<{ quizId: string }>;
}

export async function generateMetadata({ params }: QuizSoalPageProps): Promise<Metadata> {
  const { quizId } = await params;
  const quiz = await getQuizById(quizId);
  
  return {
    title: `Soal - ${quiz.judul}`,
    description: `Manajemen soal untuk quiz ${quiz.judul}`
  };
}

export default async function QuizSoalPage({ params }: QuizSoalPageProps) {
  const { quizId } = await params;
  const quiz = await getQuizById(quizId);
  
  // Add success property to match QuizResponse type
  const quizWithSuccess = {
    ...quiz,
    success: true
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <SoalHeader quiz={quizWithSuccess} />
      
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold tracking-tight">Daftar Soal</h2>
          <p className="text-muted-foreground">
            Kelola soal-soal untuk quiz ini
          </p>
        </CardHeader>
        <CardContent>
          {quiz.type === "MULTIPLE_CHOICE" && (
            <SoalPgTable quizId={quizId} />
          )}
          {quiz.type === "ESSAY" && (
            <SoalEssayTable quizId={quizId} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}