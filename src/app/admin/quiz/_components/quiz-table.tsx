// src/app/admin/quiz/_components/quiz-table.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Edit,
  MoreHorizontal,
  Trash,
  FileEdit,
  GraduationCap,
} from "lucide-react";
import { QuizDeleteDialog } from "./quiz-delete-dialog";

interface Quiz {
  id: string;
  judul: string;
  type: "MULTIPLE_CHOICE" | "ESSAY";
  status: boolean;
  _count: {
    soalPg: number;
    soalEssay: number;
  };
}

interface QuizTableProps {
  initialData: {
    quizzes: Quiz[];
    total: number;
  };
}

export function QuizTable({ initialData }: QuizTableProps) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>("");
  const [page] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  async function fetchData() {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });

      if (search) params.set("search", search);
      if (type && type !== "ALL") params.set("type", type);

      const res = await fetch(`/api/v1/quiz?${params}`);
      const json = await res.json();

      if (json.success) {
        setData(json.data);
      }
    } catch (error) {
      console.error("Failed to fetch quiz data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const debouncedSearch = useDebounce((value: unknown) => {
    setSearch(value as string);
    fetchData();
  }, 500);

  const handleTypeChange = async (value: string) => {
    setType(value);
    await fetchData();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Cari quiz..."
          onChange={(e) => debouncedSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={type} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Pilih tipe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua</SelectItem>
            <SelectItem value="MULTIPLE_CHOICE">Pilihan Ganda</SelectItem>
            <SelectItem value="ESSAY">Essay</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Judul</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>Jumlah Soal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : data.quizzes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Tidak ada data
                </TableCell>
              </TableRow>
            ) : (
              data.quizzes.map((quiz) => (
                <TableRow key={quiz.id}>
                  <TableCell className="font-medium">{quiz.judul}</TableCell>
                  <TableCell>
                    {quiz.type === "MULTIPLE_CHOICE"
                      ? "Pilihan Ganda"
                      : "Essay"}
                  </TableCell>
                  <TableCell>
                    {quiz.type === "MULTIPLE_CHOICE"
                      ? quiz._count.soalPg
                      : quiz._count.soalEssay}
                  </TableCell>
                  <TableCell>
                    <Badge variant={quiz.status ? "default" : "secondary"}>
                      {quiz.status ? "Aktif" : "Nonaktif"}
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
                          onClick={() => router.push(`/admin/quiz/${quiz.id}`)}
                        >
                          <FileEdit className="mr-2 h-4 w-4" />
                          Edit Soal
                        </DropdownMenuItem>

                        {quiz.type === "ESSAY" ? (
                          // Menu untuk quiz essay
                          <>
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/admin/quiz/${quiz.id}/results`)
                              }
                            >
                              <GraduationCap className="mr-2 h-4 w-4" />
                              Nilai Essay
                            </DropdownMenuItem>
                          </>
                        ) : (
                          // Menu untuk quiz pilihan ganda
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/admin/quiz/${quiz.id}/results`)
                            }
                          >
                            <GraduationCap className="mr-2 h-4 w-4" />
                            Lihat Nilai
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem
                          onClick={() => router.push(`/admin/quiz/${quiz.id}`)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Quiz
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setSelectedQuiz(quiz.id);
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

      {showDeleteDialog && selectedQuiz && (
        <QuizDeleteDialog
          quizId={selectedQuiz}
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onDeleted={() => {
            setSelectedQuiz(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
}
