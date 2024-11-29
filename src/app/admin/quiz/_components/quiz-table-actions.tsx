// src/app/admin/quiz/_components/quiz-table-actions.tsx

import Link from "next/link";
import { Archive, Edit, Eye, GraduationCap } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { Quiz } from "@/types/quiz";

interface QuizTableActionsProps {
  quiz: Quiz & { id: string }; // Pastikan id selalu ada
  onArchive: (id: string) => void;
}

export function QuizTableActions({ quiz, onArchive }: QuizTableActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <Eye className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <Link href={`/admin/quiz/${quiz.id}`}>
          <DropdownMenuItem>
            <Edit className="mr-2 h-4 w-4" />
            Edit Soal
          </DropdownMenuItem>
        </Link>
        <Link href={`/admin/quiz/${quiz.id}/results`}>
          <DropdownMenuItem>
            <GraduationCap className="mr-2 h-4 w-4" />
            Lihat Hasil
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem onClick={() => onArchive(quiz.id)}>
          <Archive className="mr-2 h-4 w-4" />
          Arsipkan
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}