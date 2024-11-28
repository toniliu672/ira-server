// src/app/admin/quiz/[quizId]/_components/soal-delete-dialog.tsx

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

interface SoalDeleteDialogProps {
  quizId: string;
  soalId: string;
  type: "pg" | "essay";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

export function SoalDeleteDialog({
  quizId,
  soalId,
  type,
  open,
  onOpenChange,
  onDeleted,
}: SoalDeleteDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleDelete() {
    setIsLoading(true);
    try {
      const csrfToken = getCSRFToken();
      
      const endpoint = type === "pg" ? "soal-pg" : "soal-essay";
      const res = await fetch(`/api/v1/quiz/${quizId}/${endpoint}/${soalId}`, {
        method: "DELETE",
        headers: {
          "X-CSRF-Token": csrfToken,
        },
      });

      const data = await res.json();
      if (data.success) {
        onDeleted();
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Failed to delete soal:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Soal</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus soal ini?
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
            {isLoading ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}