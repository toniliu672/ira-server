// src/app/admin/quiz/_components/quiz-delete-dialog.tsx

"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getCSRFToken } from "@/lib/csrf";

interface QuizDeleteDialogProps {
  quizId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

export function QuizDeleteDialog({
  quizId,
  open,
  onOpenChange,
  onDeleted,
}: QuizDeleteDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleDelete() {
    setIsLoading(true);
    try {
      const csrfToken = getCSRFToken();
      const res = await fetch(`/api/v1/quiz/${quizId}`, {
        method: "DELETE",
        headers: {
          "X-CSRF-Token": csrfToken,
        },
      });

      const json = await res.json();
      if (json.success) {
        onDeleted();
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Failed to delete quiz:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Quiz</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus quiz ini? Semua soal yang terkait juga akan terhapus.
            Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}