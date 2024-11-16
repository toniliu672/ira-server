// src/components/materi/create-materi-dialog.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import type { MateriCreateInput } from "@/types/materi";
import { materiCreateSchema } from "@/types/materi";

export function CreateMateriDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const form = useForm<MateriCreateInput>({
    resolver: zodResolver(materiCreateSchema),
    defaultValues: {
      judul: "",
      tujuanPembelajaran: [],
      capaianPembelajaran: [],
      deskripsi: "",
      urutan: 1,
      status: true,
    }
  });

  const handleTextareaChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    field: "tujuanPembelajaran" | "capaianPembelajaran"
  ) => {
    const value = e.target.value;
    const items = value.split("\n").filter(Boolean);
    form.setValue(field, items);
  };

  async function onSubmit(values: MateriCreateInput) {
    try {
      console.log("Form values:", values);

      const response = await fetch("/api/v1/admin/materi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCsrfToken(),
        },
        body: JSON.stringify({
          judul: values.judul,
          tujuanPembelajaran: Array.isArray(values.tujuanPembelajaran)
            ? values.tujuanPembelajaran
            : values.tujuanPembelajaran?.split("\n").filter(Boolean) || [],
          capaianPembelajaran: Array.isArray(values.capaianPembelajaran)
            ? values.capaianPembelajaran
            : values.capaianPembelajaran?.split("\n").filter(Boolean) || [],
          deskripsi: values.deskripsi || "",
          urutan: Number(values.urutan),
          status: Boolean(values.status),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("API Error:", data);
        throw new Error(data.message || "Gagal membuat materi");
      }

      toast({
        title: "Berhasil",
        description: "Materi baru telah dibuat",
      });

      form.reset();
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Create materi error:", error);
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal membuat materi",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Materi
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tambah Materi Baru</DialogTitle>
          <DialogDescription>
            Tambahkan materi pembelajaran baru dengan mengisi form berikut.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="judul"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul Materi</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan judul materi" {...field} />
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
                    <Textarea
                      placeholder="Masukkan deskripsi materi"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tujuanPembelajaran"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tujuan Pembelajaran</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Masukkan tujuan pembelajaran (satu per baris)"
                      {...field}
                      onChange={(e) => handleTextareaChange(e, "tujuanPembelajaran")}
                      value={Array.isArray(field.value) ? field.value.join("\n") : field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="capaianPembelajaran"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capaian Pembelajaran</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Masukkan capaian pembelajaran (satu per baris)"
                      {...field}
                      onChange={(e) => handleTextareaChange(e, "capaianPembelajaran")}
                      value={Array.isArray(field.value) ? field.value.join("\n") : field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="urutan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Urutan</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>Status</FormLabel>
                    <FormDescription>
                      Aktifkan untuk mempublikasikan materi
                    </FormDescription>
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

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// CSRF token helper
function getCsrfToken(): string {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf-token="))
    ?.split("=")[1] ?? "";
}