// src/app/admin/materi/[id]/edit/page.tsx

"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { getCSRFToken } from "@/lib/csrf";
import type { Materi } from "@/types/materi";

interface MateriEditProps {
  params: Promise<{ id: string }>;
}

export default function MateriEditPage({ params: paramsPromise }: MateriEditProps) {
  const params = use(paramsPromise);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Partial<Materi>>({
    judul: "",
    tujuanPembelajaran: [],
    capaianPembelajaran: [],
    deskripsi: "",
    thumbnailUrl: "",
    status: true,
    urutan: 1,
  });

  useEffect(() => {
    const fetchMateri = async () => {
      try {
        const response = await fetch(`/api/v1/materi/${params.id}`, {
          next: { tags: [`materi-${params.id}`] },
        });
        const data = await response.json();
        if (data.success) {
          setFormData(data.data);
        }
      } catch (error) {
        console.error("Error fetching materi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMateri();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const csrfToken = getCSRFToken();
      const response = await fetch(`/api/v1/materi/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push(`/admin/materi/${params.id}`);
      }
    } catch (error) {
      console.error("Error updating materi:", error);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Materi</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="judul">Judul</Label>
              <Input
                id="judul"
                value={formData.judul}
                onChange={(e) =>
                  setFormData({ ...formData, judul: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tujuan">Tujuan Pembelajaran</Label>
              <Textarea
                id="tujuan"
                value={formData.tujuanPembelajaran?.join("\n")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tujuanPembelajaran: e.target.value
                      .split("\n")
                      .filter(Boolean),
                  })
                }
                placeholder="Satu tujuan per baris"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="capaian">Capaian Pembelajaran</Label>
              <Textarea
                id="capaian"
                value={formData.capaianPembelajaran?.join("\n")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    capaianPembelajaran: e.target.value
                      .split("\n")
                      .filter(Boolean),
                  })
                }
                placeholder="Satu capaian per baris"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="deskripsi">Deskripsi</Label>
              <Textarea
                id="deskripsi"
                value={formData.deskripsi || ""}
                onChange={(e) =>
                  // src/app/admin/materi/[id]/edit/page.tsx (lanjutan)
                  setFormData({ ...formData, deskripsi: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="thumbnailUrl">URL Thumbnail</Label>
              <Input
                id="thumbnailUrl"
                value={formData.thumbnailUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, thumbnailUrl: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="urutan">Urutan</Label>
              <Input
                id="urutan"
                type="number"
                min="1"
                value={formData.urutan}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    urutan: parseInt(e.target.value),
                  })
                }
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="status"
                checked={formData.status}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, status: checked })
                }
              />
              <Label htmlFor="status">Status Aktif</Label>
            </div>

            <div className="flex gap-2">
              <Button type="submit">Simpan</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/admin/materi/${params.id}`)}
              >
                Batal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
