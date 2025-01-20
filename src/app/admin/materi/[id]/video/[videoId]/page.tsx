// src/app/admin/materi/[id]/video/[videoId]/page.tsx

"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getCSRFToken } from "@/lib/csrf";
import type { VideoMateri } from "@/types/materi";

interface VideoMateriProps {
  params: Promise<{ id: string; videoId: string }>;
}

// Function to extract YouTube video ID
function extractYoutubeId(url: string): string | null {
  const patterns = [
    /^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
    /^https?:\/\/(?:www\.)?youtube\.com\/embed\/([^/?]+)/,
    /^https?:\/\/youtu\.be\/([^/?]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

// Function to validate YouTube URL
function validateYoutubeUrl(url: string): string | null {
  if (!url) return "URL video YouTube wajib diisi";
  if (!extractYoutubeId(url)) return "Format URL YouTube tidak valid";
  return null;
}

export default function VideoMateriPage({
  params: paramsPromise,
}: VideoMateriProps) {
  const params = use(paramsPromise);
  const router = useRouter();
  const isNew = params.videoId === "new";
  const [loading, setLoading] = useState(!isNew);
  const [formData, setFormData] = useState<Partial<VideoMateri>>({
    judul: "",
    deskripsi: "",
    videoUrl: "",
    youtubeId: "",
    thumbnailUrl: "",
    durasi: 0,
    urutan: 1,
    status: true,
    materiId: params.id,
  });
  const [saving, setSaving] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  useEffect(() => {
    if (!isNew) {
      const fetchVideoMateri = async () => {
        try {
          const response = await fetch(
            `/api/v1/materi/${params.id}/video/${params.videoId}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch video data");
          }
          const data = await response.json();
          if (data.success) {
            setFormData(data.data);
          }
        } catch (error) {
          console.error("Error fetching video materi:", error);
          alert("Gagal mengambil data video");
        } finally {
          setLoading(false);
        }
      };

      fetchVideoMateri();
    } else {
      setLoading(false);
    }
  }, [params.id, params.videoId, isNew]);

  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    const error = validateYoutubeUrl(url);
    setUrlError(error);

    if (!error) {
      const youtubeId = extractYoutubeId(url);
      setFormData({
        ...formData,
        videoUrl: url,
        youtubeId: youtubeId || "",
      });
    } else {
      setFormData({
        ...formData,
        videoUrl: url,
        youtubeId: "",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    try {
      setSaving(true);
      const csrfToken = getCSRFToken();

      // Validasi basic
      if (!formData.judul?.trim()) {
        throw new Error("Judul video wajib diisi");
      }

      if (isNew && !formData.videoUrl) {
        throw new Error("URL video YouTube wajib diisi");
      }

      if (!formData.durasi || formData.durasi < 1) {
        throw new Error("Durasi video harus lebih dari 0 menit");
      }

      // Validate YouTube URL
      const urlError = validateYoutubeUrl(formData.videoUrl || "");
      if (urlError) {
        throw new Error(urlError);
      }

      const url = isNew
        ? `/api/v1/materi/${params.id}/video`
        : `/api/v1/materi/${params.id}/video/${params.videoId}`;
      const method = isNew ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({
          judul: formData.judul.trim(),
          deskripsi: formData.deskripsi?.trim() || null,
          videoUrl: formData.videoUrl,
          durasi: Math.max(1, formData.durasi || 0),
          materiId: params.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal menyimpan video materi");
      }

      router.push(`/admin/materi/${params.id}`);
      router.refresh();
    } catch (error) {
      console.error("Error saving video materi:", error);
      alert(
        error instanceof Error ? error.message : "Gagal menyimpan video materi"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (isNew) return;

    try {
      const csrfToken = getCSRFToken();
      const response = await fetch(
        `/api/v1/materi/${params.id}/video/${params.videoId}`,
        {
          method: "DELETE",
          headers: {
            "X-CSRF-Token": csrfToken,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal menghapus video");
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Gagal menghapus video");
      }

      router.push(`/admin/materi/${params.id}`);
      router.refresh();
    } catch (error) {
      console.error("Error deleting video materi:", error);
      alert(error instanceof Error ? error.message : "Gagal menghapus video");
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{isNew ? "Tambah Video" : "Edit Video"}</CardTitle>
            {!isNew && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Hapus</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                    <AlertDialogDescription>
                      Apakah Anda yakin ingin menghapus video ini?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      Hapus
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
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
              <Label htmlFor="deskripsi">Deskripsi</Label>
              <Textarea
                id="deskripsi"
                value={formData.deskripsi || ""}
                onChange={(e) =>
                  setFormData({ ...formData, deskripsi: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="videoUrl">URL Video YouTube</Label>
              <Input
                id="videoUrl"
                type="url"
                value={formData.videoUrl}
                onChange={handleVideoUrlChange}
                placeholder="https://www.youtube.com/watch?v=..."
                className={urlError ? "border-red-500" : ""}
              />
              {urlError && <p className="text-sm text-red-500">{urlError}</p>}
              {formData.youtubeId && (
                <div className="mt-2">
                  <iframe
                    width="100%"
                    height="315"
                    src={`https://www.youtube.com/embed/${formData.youtubeId}`}
                    title="YouTube video preview"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="durasi">Durasi (menit)</Label>
              <Input
                id="durasi"
                type="number"
                min="1"
                value={formData.durasi}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    durasi: parseInt(e.target.value),
                  })
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
              <Button type="submit" disabled={saving}>
                {saving ? "Menyimpan..." : "Simpan"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/admin/materi/${params.id}`)}
                disabled={saving}
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
