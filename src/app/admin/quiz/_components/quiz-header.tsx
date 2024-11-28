// src/app/admin/quiz/_components/quiz-header.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { QuizDialog } from "./quiz-dialog";

export function QuizHeader() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quiz Management</h1>
        <p className="text-muted-foreground">
          Buat dan kelola quiz beserta soal-soalnya
        </p>
      </div>

      <Button onClick={() => setShowCreateDialog(true)}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Buat Quiz
      </Button>

      <QuizDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSaved={() => setShowCreateDialog(false)}
      />
    </div>
  );
}