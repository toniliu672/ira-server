"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import type { Materi, SubMateri, VideoMateri } from "@/types/materi";

interface MateriDetailProps {
  params: Promise<{ id: string }>;
}

export default function MateriDetailPage({
  params: paramsPromise,
}: MateriDetailProps) {
  const params = use(paramsPromise);
  const router = useRouter();
  const [materi, setMateri] = useState<Materi | null>(null);
  const [subMateri, setSubMateri] = useState<SubMateri[]>([]);
  const [videoMateri, setVideoMateri] = useState<VideoMateri[]>([]);

  // Fetch materi detail, sub materi list, and video materi list
  const fetchData = async () => {
    try {
      // Fetch materi detail
      const materiRes = await fetch(`/api/v1/materi/${params.id}`, {
        next: { tags: [`materi-${params.id}`] },
      });
      const materiData = await materiRes.json();

      if (materiData.success) {
        setMateri(materiData.data);
      }

      // Fetch sub materi list
      const subMateriRes = await fetch(`/api/v1/materi/${params.id}/sub`, {
        next: { tags: [`submateri-${params.id}`] },
      });
      const subMateriData = await subMateriRes.json();

      if (subMateriData.success) {
        setSubMateri(subMateriData.data);
      }

      // Fetch video materi list
      const videoMateriRes = await fetch(`/api/v1/materi/${params.id}/video`, {
        next: { tags: [`videomateri-${params.id}`] },
      });
      const videoMateriData = await videoMateriRes.json();

      if (videoMateriData.success) {
        setVideoMateri(videoMateriData.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params.id]);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Detail Materi</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => router.push(`/admin/materi/${params.id}/edit`)}
          >
            Edit Materi
          </Button>
          <Button
            onClick={() => router.push(`/admin/materi/${params.id}/sub/new`)}
          >
            Tambah Sub Materi
          </Button>
          <Button
            onClick={() => router.push(`/admin/materi/${params.id}/video/new`)}
          >
            Tambah Video
          </Button>
        </div>
      </div>

      {materi && (
        <div className="grid gap-6">
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">{materi.judul}</h2>
            <div className="grid gap-4">
              <div>
                <label className="font-medium">Tujuan Pembelajaran:</label>
                <ul className="list-disc list-inside mt-2">
                  {materi.tujuanPembelajaran.map((tujuan, i) => (
                    <li key={i}>{tujuan}</li>
                  ))}
                </ul>
              </div>
              <div>
                <label className="font-medium">Capaian Pembelajaran:</label>
                <ul className="list-disc list-inside mt-2">
                  {materi.capaianPembelajaran.map((capaian, i) => (
                    <li key={i}>{capaian}</li>
                  ))}
                </ul>
              </div>
              <div>
                <label className="font-medium">Status:</label>
                <span
                  className={cn(
                    "ml-2 px-2 py-1 rounded text-sm",
                    materi.status
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  )}
                >
                  {materi.status ? "Aktif" : "Tidak Aktif"}
                </span>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Sub Materi</h2>
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
                {subMateri.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>{sub.judul}</TableCell>
                    <TableCell>{sub.urutan}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "px-2 py-1 rounded text-sm",
                          sub.status
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        )}
                      >
                        {sub.status ? "Aktif" : "Tidak Aktif"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            •••
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(
                                `/admin/materi/${params.id}/sub/${sub.id}`
                              )
                            }
                          >
                            Detail & Edit
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {subMateri.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Belum ada sub materi
              </div>
            )}
          </div>

          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Video Pembelajaran</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Judul</TableHead>
                  <TableHead>Durasi</TableHead>
                  <TableHead>Urutan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {videoMateri.map((video) => (
                  <TableRow key={video.id}>
                    <TableCell>{video.judul}</TableCell>
                    <TableCell>{video.durasi} menit</TableCell>
                    <TableCell>{video.urutan}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "px-2 py-1 rounded text-sm",
                          video.status
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        )}
                      >
                        {video.status ? "Aktif" : "Tidak Aktif"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            •••
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(
                                `/admin/materi/${params.id}/video/${video.id}`
                              )
                            }
                          >
                            Detail & Edit
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {videoMateri.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Belum ada video pembelajaran
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
