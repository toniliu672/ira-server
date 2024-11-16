// src/components/materi/materi-list-item.tsx

"use client";

import { useState } from "react";
import { Edit2, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { MateriWithSubMateri } from "@/types/materi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EditMateriDialog } from "./edit-materi-dialog";
import { DeleteMateriDialog } from "./delete-materi-dialog";

interface MateriListItemProps {
  materi: MateriWithSubMateri;
}

export function MateriListItem({ materi }: MateriListItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </Button>
          <div>
            <h3 className="font-medium">{materi.judul}</h3>
            <p className="text-sm text-muted-foreground">
              {materi.subMateri.length} sub-materi
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={materi.status ? "default" : "secondary"}>
            {materi.status ? "Aktif" : "Draft"}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowEditDialog(true)}
          >
            <Edit2 size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="pl-12 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Tujuan Pembelajaran</h4>
              <ul className="list-disc pl-4 space-y-1">
                {materi.tujuanPembelajaran.map((tujuan, index) => (
                  <li key={index} className="text-sm">
                    {tujuan}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Capaian Pembelajaran</h4>
              <ul className="list-disc pl-4 space-y-1">
                {materi.capaianPembelajaran.map((capaian, index) => (
                  <li key={index} className="text-sm">
                    {capaian}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {materi.deskripsi && (
            <div>
              <h4 className="font-medium mb-2">Deskripsi</h4>
              <p className="text-sm">{materi.deskripsi}</p>
            </div>
          )}

          {materi.subMateri.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Sub Materi</h4>
              <div className="space-y-2">
                {materi.subMateri.map((subMateri) => (
                  <div
                    key={subMateri.id}
                    className="border rounded p-3 flex justify-between items-center"
                  >
                    <span>{subMateri.judul}</span>
                    <Badge>Urutan: {subMateri.urutan}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <EditMateriDialog
        materi={materi}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />

      <DeleteMateriDialog
        materi={materi}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </div>
  );
}