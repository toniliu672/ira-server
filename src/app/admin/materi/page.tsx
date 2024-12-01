/* eslint-disable react-hooks/exhaustive-deps */
// src/app/admin/materi/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { getCSRFToken } from "@/lib/csrf";
import type { Materi } from "@/types/materi";

export default function MateriPage() {
  const router = useRouter();
  const [materi, setMateri] = useState<Materi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null); // untuk track item yang sedang dihapus
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState<Partial<Materi>>({
    judul: "",
    tujuanPembelajaran: [],
    capaianPembelajaran: [],
    status: true,
    urutan: 1,
  });

  const fetchMateri = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/v1/materi?search=${search}&page=${page}&limit=10`
      );
      const data = await response.json();
      if (data.success) {
        setMateri(data.data.materi);
      }
    } catch (error) {
      console.error("Error fetching materi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMateri();
  }, [search, page]);

  const handleCreate = async () => {
    try {
      setIsSubmitting(true);
      const csrfToken = getCSRFToken();
      const response = await fetch("/api/v1/materi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setShowDialog(false);
        fetchMateri();
        setFormData({
          judul: "",
          tujuanPembelajaran: [],
          capaianPembelajaran: [],
          status: true,
          urutan: 1,
        });
      } else {
        throw new Error(data.error || "Gagal membuat materi");
      }
    } catch (error) {
      console.error("Error creating materi:", error);
      alert(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus materi ini?")) {
      return;
    }

    try {
      setIsDeleting(id);
      const csrfToken = getCSRFToken();
      const response = await fetch(`/api/v1/materi/${id}`, {
        method: "DELETE",
        headers: {
          "X-CSRF-Token": csrfToken,
        },
      });

      const data = await response.json();

      if (response.ok) {
        fetchMateri();
      } else {
        throw new Error(data.error || "Gagal menghapus materi");
      }
    } catch (error) {
      console.error("Error deleting materi:", error);
      alert(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setIsDeleting(null);
    }
  };

  // Loading skeleton for table rows
  const LoadingSkeleton = () => (
    <TableRow>
      <TableCell colSpan={4}>
        <div className="w-full h-12 animate-pulse bg-gray-100 rounded-md dark:bg-gray-800" />
      </TableCell>
    </TableRow>
  );

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Daftar Materi</h1>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button>Tambah Materi</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Materi Baru</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
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
                <Input
                  id="tujuan"
                  placeholder="Pisahkan dengan koma"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tujuanPembelajaran: e.target.value.split(","),
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="capaian">Capaian Pembelajaran</Label>
                <Input
                  id="capaian"
                  placeholder="Pisahkan dengan koma"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capaianPembelajaran: e.target.value.split(","),
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
              <Button onClick={handleCreate} disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
                    Menyimpan...
                  </div>
                ) : (
                  "Simpan"
                )}
              </Button>{" "}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Cari materi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
          disabled={isLoading}
        />
        <Select
          value={page.toString()}
          onValueChange={(value) => setPage(parseInt(value))}
          disabled={isLoading}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Halaman" />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5].map((p) => (
              <SelectItem key={p} value={p.toString()}>
                Halaman {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Judul</TableHead>
              <TableHead>Urutan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Show loading skeletons
              [...Array(5)].map((_, i) => <LoadingSkeleton key={i} />)
            ) : materi.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  Tidak ada data materi
                </TableCell>
              </TableRow>
            ) : (
              materi.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.judul}</TableCell>
                  <TableCell>{item.urutan}</TableCell>
                  <TableCell>{item.status ? "Aktif" : "Tidak Aktif"}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isDeleting === item.id}
                        >
                          {isDeleting === item.id ? (
                            <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
                          ) : (
                            "•••"
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/admin/materi/${item.id}`)
                          }
                        >
                          Detail
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/admin/materi/${item.id}/edit`)
                          }
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(item.id!)}
                        >
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
