// src/app/admin/quiz/[quizId]/results/page.tsx

import { Metadata } from "next";
import { getQuizById } from "@/services/quizService";
import { QuizResultsTable } from "./_components/quiz-results-table";
import { QuizResultsHeader } from "./_components/quiz-results-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface QuizResultsPageProps {
  params: Promise<{ quizId: string }>;
}

export async function generateMetadata({ params }: QuizResultsPageProps): Promise<Metadata> {
  const { quizId } = await params;
  const quiz = await getQuizById(quizId);
  
  return {
    title: `Hasil Quiz - ${quiz.judul}`,
    description: `Manajemen hasil quiz ${quiz.judul}`
  };
}

export default async function QuizResultsPage({ params }: QuizResultsPageProps) {
  const { quizId } = await params;
  const quiz = await getQuizById(quizId);
  
  // Add success property to match QuizResponse type
  const quizWithSuccess = {
    ...quiz,
    success: true
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <QuizResultsHeader quiz={quizWithSuccess} />
      
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold tracking-tight">Hasil Quiz</h2>
          <p className="text-muted-foreground">
            Lihat dan kelola hasil quiz siswa
          </p>
        </CardHeader>
        <CardContent>
          <QuizResultsTable quizId={quizId} quizType={quiz.type} />
        </CardContent>
      </Card>
    </div>
  );
}