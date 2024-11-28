// src/app/admin/quiz/_components/quiz-dialog.tsx

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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { getCSRFToken } from "@/lib/csrf";

// Definisikan interface untuk props
interface QuizDialogProps {
  quizId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

// Schema validasi form menggunakan Zod
const quizSchema = z.object({
  judul: z.string().min(1, "Judul harus diisi"),
  deskripsi: z.string().nullable(),
  type: z.enum(["MULTIPLE_CHOICE", "ESSAY"]),
  materiId: z.string().min(1, "Materi harus dipilih"),
  status: z.boolean(),
});

type QuizInput = z.infer<typeof quizSchema>;

export function QuizDialog({
  quizId,
  open,
  onOpenChange,
  onSaved,
}: QuizDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [materi, setMateri] = useState<Array<{ id: string; judul: string }>>([]);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<QuizInput>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      judul: "",
      deskripsi: "",
      type: "MULTIPLE_CHOICE",
      materiId: "",
      status: true,
    },
  });

  useEffect(() => {
    // Load materi data
    fetch("/api/v1/materi?status=true")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMateri(data.data.materi);
        } else {
          setError("Gagal memuat data materi");
        }
      })
      .catch(() => {
        setError("Gagal memuat data materi");
      });

    // Load quiz data if editing
    if (quizId) {
      fetch(`/api/v1/quiz/${quizId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            form.reset({
              judul: data.data.judul,
              deskripsi: data.data.deskripsi,
              type: data.data.type,
              materiId: data.data.materiId,
              status: data.data.status,
            });
          }
        });
    }
  }, [quizId, form]);

  async function onSubmit(values: QuizInput) {
    setIsLoading(true);
    setError(null);
    
    try {
      const csrfToken = getCSRFToken();
      
      const submitData = {
        judul: values.judul.trim(),
        deskripsi: values.deskripsi?.trim() || null,
        type: values.type,
        materiId: values.materiId,
        status: values.status
      };

      const url = quizId ? `/api/v1/quiz/${quizId}` : "/api/v1/quiz";
      const method = quizId ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify(submitData),
      });

      const data = await res.json();

      if (data.success) {
        onSaved();
        onOpenChange(false);
      } else {
        // Handle validation errors
        if (data.details) {
          data.details.forEach((detail: { message: string }) => {
            setError(detail.message);
          });
        } else {
          setError(data.error || "Gagal menyimpan quiz");
        }
      }
    } catch (error) {
      setError("Terjadi kesalahan saat menyimpan quiz");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{quizId ? "Edit Quiz" : "Buat Quiz Baru"}</DialogTitle>
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
              name="materiId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Materi</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih materi" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {materi.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.judul}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="judul"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deskripsi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipe Quiz</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!!quizId} // Disable if editing
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tipe quiz" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MULTIPLE_CHOICE">
                        Pilihan Ganda
                      </SelectItem>
                      <SelectItem value="ESSAY">Essay</SelectItem>
                    </SelectContent>
                  </Select>
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
                {isLoading ? "Menyimpan..." : (quizId ? "Simpan" : "Buat")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}