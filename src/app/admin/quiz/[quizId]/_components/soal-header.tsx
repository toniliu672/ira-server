// src/app/admin/quiz/[quizId]/_components/soal-header.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { SoalPgDialog } from "./soal-pg-dialog";
import { SoalEssayDialog } from "./soal-essay-dialog";
import { Quiz } from "@/types/quiz";

interface SoalHeaderProps {
  quiz: Quiz & { success: boolean };
  onSoalAdded?: () => void;
}

export function SoalHeader({ quiz, onSoalAdded }: SoalHeaderProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleSoalSaved = async () => {
    setShowCreateDialog(false);
    if (onSoalAdded) {
      onSoalAdded();
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Soal Quiz: {quiz.judul}
        </h1>
        <p className="text-muted-foreground">
          {quiz.type === "MULTIPLE_CHOICE" 
            ? "Kelola soal pilihan ganda" 
            : "Kelola soal essay"}
        </p>
      </div>

      <Button onClick={() => setShowCreateDialog(true)}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Tambah Soal
      </Button>

      {quiz.type === "MULTIPLE_CHOICE" ? (
        <SoalPgDialog
          quizId={quiz.id || ""}
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSaved={handleSoalSaved}
        />
      ) : (
        <SoalEssayDialog
          quizId={quiz.id || ""}
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSaved={handleSoalSaved}
        />
      )}
    </div>
  );
}