// src/app/admin/materi/[id]/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { materiCreateSchema } from '@/types/materi';
import type { z } from 'zod';

type FormValues = z.infer<typeof materiCreateSchema>;

interface PageProps {
  params: {
    id: string;
  };
}

export default function EditMateriPage({ params }: PageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(materiCreateSchema)
  });

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/v1/admin/materi/${params.id}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.message);

        form.reset({
          judul: data.data.judul,
          deskripsi: data.data.deskripsi,
          tujuanPembelajaran: data.data.tujuanPembelajaran,
          capaianPembelajaran: data.data.capaianPembelajaran,
          urutan: data.data.urutan,
          status: data.data.status
        });
      } catch (e) {
        alert((e as Error).message);
        router.push('/admin/materi');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [params.id, form, router]);

  async function onSubmit(values: FormValues) {
    try {
      setSubmitting(true);
      const res = await fetch(`/api/v1/admin/materi/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }

      router.push('/admin/materi');
      router.refresh();

    } catch (e) {
      console.error('Error:', (e as Error).message);
      alert('Gagal mengupdate materi');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Materi</h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Judul</label>
            <Input
              {...form.register('judul')}
              placeholder="Masukkan judul materi"
              disabled={submitting}
            />
            {form.formState.errors.judul && (
              <p className="text-sm text-red-500">{form.formState.errors.judul.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Deskripsi</label>
            <Textarea
              {...form.register('deskripsi')}
              placeholder="Masukkan deskripsi materi"
              disabled={submitting}
            />
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium">Tujuan Pembelajaran</label>
            {form.watch('tujuanPembelajaran')?.map((_, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  {...form.register(`tujuanPembelajaran.${index}`)}
                  placeholder={`Tujuan pembelajaran ${index + 1}`}
                  disabled={submitting}
                />
                {index > 0 && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      const current = form.getValues('tujuanPembelajaran');
                      form.setValue('tujuanPembelajaran', 
                        current.filter((_, i) => i !== index)
                      );
                    }}
                    disabled={submitting}
                  >
                    Hapus
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const current = form.getValues('tujuanPembelajaran') || [];
                form.setValue('tujuanPembelajaran', [...current, '']);
              }}
              disabled={submitting}
            >
              Tambah Tujuan
            </Button>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium">Capaian Pembelajaran</label>
            {form.watch('capaianPembelajaran')?.map((_, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  {...form.register(`capaianPembelajaran.${index}`)}
                  placeholder={`Capaian pembelajaran ${index + 1}`}
                  disabled={submitting}
                />
                {index > 0 && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      const current = form.getValues('capaianPembelajaran');
                      form.setValue('capaianPembelajaran', 
                        current.filter((_, i) => i !== index)
                      );
                    }}
                    disabled={submitting}
                  >
                    Hapus
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const current = form.getValues('capaianPembelajaran') || [];
                form.setValue('capaianPembelajaran', [...current, '']);
              }}
              disabled={submitting}
            >
              Tambah Capaian
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Urutan</label>
            <Input
              type="number"
              {...form.register('urutan', { valueAsNumber: true })}
              disabled={submitting}
            />
            {form.formState.errors.urutan && (
              <p className="text-sm text-red-500">{form.formState.errors.urutan.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={form.watch('status')}
              onCheckedChange={val => form.setValue('status', val)}
              disabled={submitting}
            />
            <label className="text-sm font-medium">Status Aktif</label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => router.back()}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}