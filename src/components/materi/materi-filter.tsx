// src/components/materi/materi-filter.tsx

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export function MateriFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") || "";
  const sortBy = searchParams.get("sortBy") || "urutan";
  const sortOrder = searchParams.get("sortOrder") || "asc";
  const status = searchParams.get("status");

  const updateSearchParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    router.push(`?${params.toString()}`);
  };

  const handleSearch = useDebounce((value: string) => {
    updateSearchParams({ search: value || null });
  }, 500);

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Input
        placeholder="Cari materi..."
        defaultValue={search}
        onChange={(e) => handleSearch(e.target.value)}
        className="sm:max-w-[300px]"
      />
      <Select
        value={sortBy}
        onValueChange={(value) => updateSearchParams({ sortBy: value })}
      >
        <SelectTrigger className="sm:w-[180px]">
          <SelectValue placeholder="Urutkan berdasarkan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="urutan">Urutan</SelectItem>
          <SelectItem value="judul">Judul</SelectItem>
          <SelectItem value="createdAt">Tanggal Dibuat</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={sortOrder}
        onValueChange={(value) => updateSearchParams({ sortOrder: value })}
      >
        <SelectTrigger className="sm:w-[180px]">
          <SelectValue placeholder="Urutan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="asc">Ascending</SelectItem>
          <SelectItem value="desc">Descending</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={status || "all"}
        onValueChange={(value) => 
          updateSearchParams({ 
            status: value === "all" ? null : value 
          })
        }
      >
        <SelectTrigger className="sm:w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua</SelectItem>
          <SelectItem value="true">Aktif</SelectItem>
          <SelectItem value="false">Draft</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}