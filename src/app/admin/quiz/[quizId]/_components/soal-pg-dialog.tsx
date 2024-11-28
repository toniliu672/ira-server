// src/app/admin/quiz/[quizId]/_components/soal-pg-dialog.tsx

"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray, FieldValues } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { getCSRFToken } from "@/lib/csrf";

interface SoalPgDialogProps {
  quizId: string;
  soalId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

const soalPgSchema = z.object({
  pertanyaan: z.string().min(1, "Pertanyaan harus diisi"),
  opsiJawaban: z.array(z.string().min(1, "Opsi jawaban harus diisi")).min(2, "Minimal 2 opsi jawaban"),
  kunciJawaban: z.string().min(0, "Kunci jawaban harus dipilih"),
  status: z.boolean().default(true),
});

interface FormValues extends FieldValues {
  pertanyaan: string;
  opsiJawaban: string[];
  kunciJawaban: string;
  status: boolean;
}

const defaultValues: FormValues = {
  pertanyaan: "",
  opsiJawaban: ["", ""],
  kunciJawaban: "0",
  status: true,
};

export function SoalPgDialog({
  quizId,
  soalId,
  open,
  onOpenChange,
  onSaved,
}: SoalPgDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(soalPgSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray<FormValues>({
    control: form.control,
    name: "opsiJawaban",
  });


  useEffect(() => {
    if (soalId) {
      fetch(`/api/v1/quiz/${quizId}/soal-pg/${soalId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            form.reset({
              pertanyaan: data.data.pertanyaan,
              opsiJawaban: data.data.opsiJawaban,
              kunciJawaban: data.data.kunciJawaban.toString(),
              status: data.data.status,
            });
          }
        });
    } else {
      form.reset(defaultValues);
    }
  }, [soalId, quizId, form]);

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setError(null);
    
    try {
      const csrfToken = getCSRFToken();
      
      const submitData = {
        ...values,
        kunciJawaban: parseInt(values.kunciJawaban),
        opsiJawaban: values.opsiJawaban.map(opsi => opsi.trim()),
      };

      const url = soalId 
        ? `/api/v1/quiz/${quizId}/soal-pg/${soalId}`
        : `/api/v1/quiz/${quizId}/soal-pg`;
        
      const method = soalId ? "PATCH" : "POST";

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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {soalId ? "Edit Soal Pilihan Ganda" : "Tambah Soal Pilihan Ganda"}
          </DialogTitle>
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

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>Opsi Jawaban</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append("")}
                  disabled={fields.length >= 5}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Opsi
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-start">
                  <FormField
                    control={form.control}
                    name={`opsiJawaban.${index}`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input {...field} placeholder={`Opsi ${index + 1}`} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {fields.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <FormField
              control={form.control}
              name="kunciJawaban"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kunci Jawaban</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kunci jawaban" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {fields.map((_, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          Opsi {index + 1}
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