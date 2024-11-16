// src/components/materi/delete-materi-dialog.tsx
"use client";

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
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import type { MateriWithSubMateri } from "@/types/materi";

interface DeleteMateriDialogProps {
  materi: MateriWithSubMateri;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteMateriDialog({
  materi,
  open,
  onOpenChange,
}: DeleteMateriDialogProps) {
  const router = useRouter();

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/v1/admin/materi/${materi.id}`, {
        method: "DELETE",
        headers: {
          "x-csrf-token": getCsrfToken(),
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete materi");
      }

      toast({
        title: "Berhasil",
        description: "Materi telah dihapus",
      });

      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: "Gagal menghapus materi",
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Materi</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus materi &quot;{materi.judul}&quot;?
            Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Hapus</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function getCsrfToken(): string {
  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrf-token="))
      ?.split("=")[1] ?? ""
  );
}
