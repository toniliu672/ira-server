// src/app/admin/materi/page.tsx

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getMateri } from '@/services/materiService';

export default async function MateriPage() {
  const result = await getMateri({
    search: '',
    sortBy: 'urutan',
    sortOrder: 'asc'
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Materi</h1>
        <Button asChild>
          <Link href="/admin/materi/buat">Tambah Materi</Link>
        </Button>
      </div>

      <Card className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Judul</TableHead>
              <TableHead>Urutan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.materi.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.judul}</TableCell>
                <TableCell>{item.urutan}</TableCell>
                <TableCell>{item.status ? 'Aktif' : 'Nonaktif'}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/materi/${item.id}`}>
                      Edit
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}