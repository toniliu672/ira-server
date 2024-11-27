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
import { validateFile } from "@/utils/upload";
import type { VideoMateri } from "@/types/materi";

interface VideoMateriProps {
  params: Promise<{ id: string; videoId: string }>;
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
    thumbnailUrl: "",
    durasi: 0,
    urutan: 1,
    status: true,
    materiId: params.id,
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

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

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = await validateFile(file, "video");
    if (error) {
      alert(error.message);
      e.target.value = ""; // Reset input
      return;
    }

    setVideoFile(file);
  };

  const handleThumbnailChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = await validateFile(file, "image");
    if (error) {
      alert(error.message);
      e.target.value = ""; // Reset input
      return;
    }

    setThumbnailFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploading) return;

    try {
      setUploading(true);
      const csrfToken = getCSRFToken();

      // Validasi basic
      if (!formData.judul?.trim()) {
        throw new Error("Judul video wajib diisi");
      }

      if (isNew && !videoFile) {
        throw new Error("File video wajib diupload");
      }

      if (!formData.durasi || formData.durasi < 1) {
        throw new Error("Durasi video harus lebih dari 0 menit");
      }

      const formDataToSend = new FormData();

      if (videoFile) {
        formDataToSend.append("video", videoFile);
      }
      if (thumbnailFile) {
        formDataToSend.append("thumbnail", thumbnailFile);
      }

      // Prepare input data
      const dataToSend = {
        judul: formData.judul.trim(),
        deskripsi: formData.deskripsi?.trim() || null,
        durasi: Math.max(1, formData.durasi || 0),
        materiId: params.id,
      };

      formDataToSend.append("data", JSON.stringify(dataToSend));

      const url = isNew
        ? `/api/v1/materi/${params.id}/video`
        : `/api/v1/materi/${params.id}/video/${params.videoId}`;
      const method = isNew ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: {
          "X-CSRF-Token": csrfToken,
        },
        body: formDataToSend,
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
      setUploading(false);
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
              <Label htmlFor="video">Video</Label>
              <Input
                id="video"
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
              />
              {formData.videoUrl && (
                <div className="text-sm text-gray-500">
                  Video saat ini: {formData.videoUrl}
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="thumbnail">Thumbnail</Label>
              <Input
                id="thumbnail"
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
              />
              {formData.thumbnailUrl && (
                <div className="text-sm text-gray-500">
                  Thumbnail saat ini: {formData.thumbnailUrl}
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
              <Button type="submit" disabled={uploading}>
                {uploading ? "Menyimpan..." : "Simpan"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/admin/materi/${params.id}`)}
                disabled={uploading}
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
