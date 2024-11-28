// src/app/admin/quiz/[quizId]/_components/soal-essay-dialog.tsx

"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { getCSRFToken } from "@/lib/csrf";

interface SoalEssayDialogProps {
  quizId: string;
  soalId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

const soalEssaySchema = z.object({
  pertanyaan: z.string().min(1, "Pertanyaan harus diisi"),
  status: z.boolean().default(true),
});

type SoalEssayInput = z.infer<typeof soalEssaySchema>;

export function SoalEssayDialog({
  quizId,
  soalId,
  open,
  onOpenChange,
  onSaved,
}: SoalEssayDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<SoalEssayInput>({
    resolver: zodResolver(soalEssaySchema),
    defaultValues: {
      pertanyaan: "",
      status: true,
    },
  });

  useEffect(() => {
    if (soalId) {
      fetch(`/api/v1/quiz/${quizId}/soal-essay/${soalId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            form.reset({
              pertanyaan: data.data.pertanyaan,
              status: data.data.status,
            });
          }
        });
    }
  }, [soalId, quizId, form]);

  async function onSubmit(values: SoalEssayInput) {
    setIsLoading(true);
    setError(null);
    
    try {
      const csrfToken = getCSRFToken();
      
      const url = soalId 
        ? `/api/v1/quiz/${quizId}/soal-essay/${soalId}`
        : `/api/v1/quiz/${quizId}/soal-essay`;
        
      const method = soalId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (data.success) {
        onSaved();
        onOpenChange(false);
      } else {
        setError(data.error || "Gagal menyimpan soal");
      }
    } catch (error) {
      setError("Terjadi kesalahan saat menyimpan soal");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{soalId ? "Edit Soal Essay" : "Tambah Soal Essay"}</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md">
            {error}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="pertanyaan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pertanyaan</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Status</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Menyimpan..." : (soalId ? "Simpan" : "Tambah")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}