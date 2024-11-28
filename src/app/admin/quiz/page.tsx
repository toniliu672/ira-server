// src/app/admin/quiz/page.tsx

import { Metadata } from "next";
import { getQuizzes } from "@/services/quizService";
import { QuizTable } from "./_components/quiz-table";
import { QuizHeader } from "./_components/quiz-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Quiz Management",
  description: "Halaman manajemen quiz dan soal"
};

export default async function QuizPage() {
  // Get initial data with server component
  const initialData = await getQuizzes({
    search: "",
    page: 1,
    limit: 10,
    sortBy: "judul",
    sortOrder: "asc",
    status: true
  });
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <QuizHeader />
      
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold tracking-tight">Quiz</h2>
            <p className="text-muted-foreground">
              Kelola quiz dan soal-soal yang tersedia
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <QuizTable initialData={initialData} />
        </CardContent>
      </Card>
    </div>
  );
}