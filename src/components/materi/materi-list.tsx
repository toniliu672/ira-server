// src/components/materi/materi-list.tsx

import { Suspense } from "react";
import { getMateri } from "@/services/materiService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MateriListItem } from "./materi-list-item";
import { MateriListEmpty } from "./materi-list-empty";
import { MateriPagination } from "./materi-pagination";

interface MateriListProps {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}

export async function MateriList({
  page = 1,
  limit = 10,
  search = "",
  sortBy = "urutan",
  sortOrder = "asc",
}: MateriListProps) {
  const result = await getMateri({
    page,
    limit,
    search,
    sortBy: sortBy as "judul" | "urutan" | "createdAt",
    sortOrder: sortOrder as "asc" | "desc",
  });

  if (!result.materi.length) {
    return <MateriListEmpty />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Materi</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {result.materi.map((materi) => (
            <Suspense
              key={materi.id}
              fallback={<div className="h-20 animate-pulse bg-muted rounded" />}
            >
              <MateriListItem materi={materi} />
            </Suspense>
          ))}
        </div>
        <MateriPagination
          currentPage={page}
          totalPages={Math.ceil(result.total / limit)}
          totalItems={result.total}
        />
      </CardContent>
    </Card>
  );
}
