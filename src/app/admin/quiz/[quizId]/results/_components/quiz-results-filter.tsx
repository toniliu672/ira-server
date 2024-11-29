// src/app/admin/quiz/[quizId]/results/_components/quiz-results-filter.tsx

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface QuizResultsFilterProps {
  isEssayQuiz?: boolean;
}

export function QuizResultsFilter({ isEssayQuiz }: QuizResultsFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "all";
  const sortBy = searchParams.get("sortBy") || "fullName";
  const sortOrder = searchParams.get("sortOrder") || "asc";

  const updateQuery = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`?${params.toString()}`);
  };

  // Perbaiki tipe function untuk useDebounce
  const debouncedSearch = useDebounce((...args: unknown[]) => {
    if (typeof args[0] === 'string') {
      updateQuery({ search: args[0] });
    }
  }, 500);

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 md:w-80">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau username..."
            defaultValue={search}
            onChange={(e) => debouncedSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        {isEssayQuiz && (
          <Select
            defaultValue={status}
            onValueChange={(value) => updateQuery({ status: value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="GRADED">Sudah Dinilai</SelectItem>
              <SelectItem value="UNGRADED">Belum Dinilai</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="flex gap-2">
        <Select
          defaultValue={sortBy}
          onValueChange={(value) => updateQuery({ sortBy: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Urutkan Berdasarkan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fullName">Nama</SelectItem>
            <SelectItem value="submittedAt">Tanggal Submit</SelectItem>
            <SelectItem value="avgScore">Nilai</SelectItem>
          </SelectContent>
        </Select>

        <Select
          defaultValue={sortOrder}
          onValueChange={(value) => updateQuery({ sortOrder: value })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Urutan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Naik (A-Z)</SelectItem>
            <SelectItem value="desc">Turun (Z-A)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}