// src/app/admin/admin-account/_components/edit-admin-dialog.tsx

"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminSchema, type AdminResponse } from "@/types/admin";

const editAdminSchema = adminSchema.pick({
  username: true,
  name: true,
  email: true,
}).extend({
  password: z.string().min(8).optional().or(z.literal('')),
});

type FormValues = z.infer<typeof editAdminSchema>;

interface EditAdminDialogProps {
  admin: AdminResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditAdminDialog({
  admin,
  open,
  onOpenChange,
  onSuccess,
}: EditAdminDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(editAdminSchema),
    defaultValues: {
      username: "",
      name: "",
      email: "",
      password: "",
    },
  });

  // Reset form when dialog opens/closes or admin changes
  useEffect(() => {
    if (open && admin) {
      form.reset({
        username: admin.username || "",
        name: admin.name || "",
        email: admin.email || "",
        password: "",
      });
    } else if (!open) {
      form.reset({
        username: "",
        name: "",
        email: "",
        password: "",
      });
    }
  }, [admin, open, form]);

  const handleSubmit = async (data: FormValues) => {
    if (!admin?.id) return;

    try {
      // Only include password if it's not empty
      const submitData = {
        ...data,
        password: data.password || undefined,
      };

      const response = await fetch(`/api/v1/auth/admin/account/${admin.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": document.cookie.match(/csrf-token=([^;]+)/)?.[1] || ""
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      toast.success("Sukses", {
        description: "Admin berhasil diupdate"
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
          <DialogTitle>Edit Admin</DialogTitle>
          <DialogDescription>
            Update data administrator. Password opsional.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password Baru (Opsional)</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}