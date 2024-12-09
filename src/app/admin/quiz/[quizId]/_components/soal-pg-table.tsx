// src/app/admin/quiz/[quizId]/_components/soal-pg-table.tsx

"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import { SoalPgDialog } from "./soal-pg-dialog";
import { SoalDeleteDialog } from "./soal-delete-dialog";
import { SoalPg } from "@/types/quiz";

interface SoalPgTableProps {
  quizId: string;
}

export function SoalPgTable({ quizId }: SoalPgTableProps) {
  const [search, setSearch] = useState("");
  const [data, setData] = useState<SoalPg[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSoal, setSelectedSoal] = useState<string>("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      if (search) params.set("search", search);

      const res = await fetch(`/api/v1/quiz/${quizId}/soal-pg?${params}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (error) {
      console.error("Failed to fetch multiple choice questions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataChange = () => {
    fetchData();
  };

  const debouncedSearch = useDebounce((value: unknown) => {
    setSearch(value as string);
    fetchData();
  }, 500);

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

  // Rest of the component stays the same
  return (
    <div className="space-y-4">
      <Input
        placeholder="Cari soal..."
        onChange={(e) => debouncedSearch(e.target.value)}
        className="max-w-xs"
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">No.</TableHead>
              <TableHead>Pertanyaan</TableHead>
              <TableHead>Opsi Jawaban</TableHead>
              <TableHead>Kunci Jawaban</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : !data?.length ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Belum ada soal
                </TableCell>
              </TableRow>
            ) : (
              data.map((soal: SoalPg, index: number) => (
                <TableRow key={soal.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{soal.pertanyaan}</TableCell>
                  <TableCell>
                    <ol className="list-decimal list-inside">
                      {soal.opsiJawaban.map((opsi: string, index: number) => (
                        <li key={index}>{opsi}</li>
                      ))}
                    </ol>
                  </TableCell>
                  <TableCell>{soal.kunciJawaban + 1}</TableCell>
                  <TableCell>
                    <Badge variant={soal.status ? "default" : "secondary"}>
                      {soal.status ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedSoal(soal.id || "");
                            setShowEditDialog(true);
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setSelectedSoal(soal.id || "");
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash className="mr-2 h-4 w-4" />
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

      {showEditDialog && selectedSoal && (
        <SoalPgDialog
          quizId={quizId}
          soalId={selectedSoal}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSaved={handleDataChange}
        />
      )}

      {showDeleteDialog && selectedSoal && (
        <SoalDeleteDialog
          quizId={quizId}
          soalId={selectedSoal}
          type="pg"
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onDeleted={handleDataChange}
        />
      )}
    </div>
  );
}