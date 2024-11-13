// src/app/admin/admin-account/_components/delete-admin-dialog.tsx

"use client";

import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { type AdminResponse } from "@/types/admin";

interface DeleteAdminDialogProps {
  admin: AdminResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteAdminDialog({
  admin,
  open,
  onOpenChange,
  onSuccess,
}: DeleteAdminDialogProps) {
  const handleDelete = async () => {
    if (!admin) return;

    try {
      const response = await fetch(`/api/v1/auth/admin/account/${admin.id}`, {
        method: "DELETE",
        headers: {
          "X-CSRF-Token": document.cookie.match(/csrf-token=([^;]+)/)?.[1] || ""
        },
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      toast.success("Sukses", {
        description: "Admin berhasil dihapus"
      });
      
      onOpenChange(false);
      onSuccess();
    } catch (e) {
      const error = e as Error;
      toast.error("Error", {
        description: error.message
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hapus Admin</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus admin ini? Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
          >
            Hapus
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}