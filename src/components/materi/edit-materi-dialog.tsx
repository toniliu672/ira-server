// src/components/materi/edit-materi-dialog.tsx

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { materiUpdateSchema } from "@/types/materi";
import type { MateriWithSubMateri, MateriUpdateInput } from "@/types/materi";

interface EditMateriDialogProps {
  materi: MateriWithSubMateri;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditMateriDialog({
  materi,
  open,
  onOpenChange,
}: EditMateriDialogProps) {
  const router = useRouter();

  const form = useForm<MateriUpdateInput>({
    resolver: zodResolver(materiUpdateSchema),
    defaultValues: {
      judul: materi.judul,
      tujuanPembelajaran: materi.tujuanPembelajaran,
      capaianPembelajaran: materi.capaianPembelajaran,
      deskripsi: materi.deskripsi || "",
      urutan: materi.urutan,
      status: materi.status,
    },
  });

  // Reset form when materi changes
  useEffect(() => {
    if (open) {
      form.reset({
        judul: materi.judul,
        tujuanPembelajaran: materi.tujuanPembelajaran,
        capaianPembelajaran: materi.capaianPembelajaran,
        deskripsi: materi.deskripsi || "",
        urutan: materi.urutan,
        status: materi.status,
      });
    }
  }, [form, materi, open]);

  async function onSubmit(data: MateriUpdateInput) {
    try {
      const response = await fetch(`/api/v1/admin/materi/${materi.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCsrfToken(),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update materi");
      }

      toast({
        title: "Berhasil",
        description: "Materi telah diperbarui",
      });

      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Operation failed:", error.message);
      toast({
        title: "Error",
        description: "Gagal memperbarui materi",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Materi</DialogTitle>
          <DialogDescription>
            Perbarui informasi materi pembelajaran.
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
                      onChange={(e) =>
                        field.onChange(
                          e.target.value.split("\n").filter(Boolean)
                        )
                      }
                      value={field.value?.join("\n") || ""}
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
                      onChange={(e) =>
                        field.onChange(
                          e.target.value.split("\n").filter(Boolean)
                        )
                      }
                      value={field.value?.join("\n") || ""}
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

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
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
