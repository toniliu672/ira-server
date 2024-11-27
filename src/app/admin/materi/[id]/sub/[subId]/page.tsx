"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { UploadImage } from "@/components/upload-image";
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
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Image as ImageIcon,
  Link as LinkIcon,
  List,
  ListOrdered,
  Undo,
  Redo,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getCSRFToken } from "@/lib/csrf";

interface FormData {
  judul: string;
  konten: string;
  imageUrls: string[];
  urutan: number;
  status: boolean;
  materiId: string;
}

export default function SubMateriPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string; subId: string }>;
}) {
  const params = use(paramsPromise);
  const router = useRouter();
  const isNew = params.subId === "new";

  const [formData, setFormData] = useState<FormData>({
    judul: "",
    konten: "",
    imageUrls: [],
    urutan: 1,
    status: true,
    materiId: params.id,
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    content: formData.konten,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setFormData((prev) => ({ ...prev, konten: html }));
    },
  });

  useEffect(() => {
    if (!isNew) {
      const fetchSubMateri = async () => {
        try {
          const response = await fetch(
            `/api/v1/materi/${params.id}/sub/${params.subId}`
          );
          const data = await response.json();
          if (data.success && data.data) {
            setFormData({
              judul: data.data.judul,
              konten: data.data.konten,
              imageUrls: data.data.imageUrls || [],
              urutan: data.data.urutan,
              status: data.data.status,
              materiId: data.data.materiId,
            });
            editor?.commands.setContent(data.data.konten);
          }
        } catch (error) {
          console.error("Error fetching sub materi:", error);
        }
      };

      fetchSubMateri();
    }
  }, [params.id, params.subId, isNew, editor]);

  const handleImageUploadSuccess = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      imageUrls: [...prev.imageUrls, url],
    }));
  };

  const handleImageRemove = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((u) => u !== url),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate required fields
      if (!formData.judul || !formData.konten) {
        alert("Judul dan konten harus diisi");
        return;
      }

      const csrfToken = getCSRFToken();
      const url = isNew
        ? `/api/v1/materi/${params.id}/sub`
        : `/api/v1/materi/${params.id}/sub/${params.subId}`;
      const method = isNew ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        router.push(`/admin/materi/${params.id}`);
        router.refresh(); // Refresh untuk memperbarui data
      } else {
        throw new Error(data.error || "Gagal menyimpan sub materi");
      }
    } catch (error) {
      console.error("Error saving sub materi:", error);
      alert(
        error instanceof Error ? error.message : "Gagal menyimpan sub materi"
      );
    }
  };

  const handleDelete = async () => {
    if (isNew) return;

    try {
      const csrfToken = getCSRFToken();
      const response = await fetch(
        `/api/v1/materi/${params.id}/sub/${params.subId}`,
        {
          method: "DELETE",
          headers: {
            "X-CSRF-Token": csrfToken,
          },
        }
      );

      if (response.ok) {
        router.push(`/admin/materi/${params.id}`);
        router.refresh();
      }
    } catch (error) {
      console.error("Error deleting sub materi:", error);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              {isNew ? "Tambah Sub Materi" : "Edit Sub Materi"}
            </CardTitle>
            {!isNew && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Hapus</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                    <AlertDialogDescription>
                      Apakah Anda yakin ingin menghapus sub materi ini?
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
                  setFormData((prev) => ({ ...prev, judul: e.target.value }))
                }
                required
                minLength={3}
              />
            </div>

            <div className="grid gap-2">
              <Label>Konten</Label>
              <div className="border rounded-md">
                <div className="flex flex-wrap gap-1 border-b p-1">
                  <Button
                    type="button"
                    variant={editor?.isActive("bold") ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant={editor?.isActive("italic") ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant={
                      editor?.isActive("underline") ? "secondary" : "ghost"
                    }
                    size="icon"
                    onClick={() =>
                      editor?.chain().focus().toggleUnderline().run()
                    }
                  >
                    <UnderlineIcon className="h-4 w-4" />
                  </Button>
                  <div className="w-px h-6 bg-border mx-1" />
                  <Button
                    type="button"
                    variant={
                      editor?.isActive("bulletList") ? "secondary" : "ghost"
                    }
                    size="icon"
                    onClick={() =>
                      editor?.chain().focus().toggleBulletList().run()
                    }
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant={
                      editor?.isActive("orderedList") ? "secondary" : "ghost"
                    }
                    size="icon"
                    onClick={() =>
                      editor?.chain().focus().toggleOrderedList().run()
                    }
                  >
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                  <div className="w-px h-6 bg-border mx-1" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const url = window.prompt("URL Gambar:");
                      if (url) {
                        editor?.chain().focus().setImage({ src: url }).run();
                        // Tambahkan URL gambar ke array imageUrls
                        setFormData((prev) => ({
                          ...prev,
                          imageUrls: [...prev.imageUrls, url],
                        }));
                      }
                    }}
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant={editor?.isActive("link") ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => {
                      const url = window.prompt("URL:");
                      if (url) {
                        editor?.chain().focus().toggleLink({ href: url }).run();
                      }
                    }}
                  >
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                  <div className="w-px h-6 bg-border mx-1" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => editor?.chain().focus().undo().run()}
                  >
                    <Undo className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => editor?.chain().focus().redo().run()}
                  >
                    <Redo className="h-4 w-4" />
                  </Button>
                </div>
                <EditorContent
                  editor={editor}
                  className={cn(
                    "prose prose-sm max-w-none min-h-[200px] p-4",
                    "prose-headings:my-2 prose-p:my-2 prose-ul:my-2 prose-ol:my-2",
                    "focus:outline-none"
                  )}
                />
              </div>
            </div>

            <UploadImage
              images={formData.imageUrls}
              onUploadSuccess={handleImageUploadSuccess}
              onRemove={handleImageRemove}
            />

            <div className="grid gap-2">
              <Label htmlFor="urutan">Urutan</Label>
              <Input
                id="urutan"
                type="number"
                min="1"
                value={formData.urutan}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    urutan: parseInt(e.target.value) || 1,
                  }))
                }
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="status"
                checked={formData.status}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, status: checked }))
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
