// src/components/users/user-list.tsx

"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus, Search, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { UserDialog } from "./user-dialog";
import type { UserResponse } from "@/types/user";

const ITEMS_PER_PAGE = 10;

export function UserList() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [users, setUsers] = useState<UserResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [page, setPage] = useState(() => {
    const pageParam = searchParams.get("page");
    return pageParam ? parseInt(pageParam, 10) : 1;
  });
  const [search, setSearch] = useState(() => searchParams.get("search") || "");

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(ITEMS_PER_PAGE),
        search,
      });

      // Update URL
      router.push(`?${params.toString()}`, { scroll: false });

      const response = await fetch(`/api/v1/admin/users?${params}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch users");
      }

      const data = await response.json();
      if (data.success) {
        setUsers(data.data.users);
        setTotal(data.data.total);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Gagal memuat data user";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [page, search, router]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleDelete = async (id: string) => {
    try {
      // Ambil CSRF token dari cookie
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("csrf-token="))
        ?.split("=")[1];

      const response = await fetch(`/api/v1/admin/users/${id}`, {
        method: "DELETE",
        credentials: "include", // Penting untuk mengirim cookies
        headers: {
          "X-CSRF-Token": csrfToken || "", // Tambahkan CSRF token ke header
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete user");
      }

      toast.success("User berhasil dihapus");
      loadUsers(); // Refresh data setelah delete berhasil
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Gagal menghapus user";
      toast.error(errorMessage);
      console.error("Delete error:", err);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleEdit = (user: UserResponse) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Cari user..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-64"
          />
          <Button variant="outline" className="gap-2" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Cari
          </Button>
        </div>

        <Button
          onClick={() => {
            setSelectedUser(null);
            setOpenDialog(true);
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Tambah User
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Nama Lengkap</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tanggal Dibuat</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Tidak ada data user
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={user.activeStatus ? "default" : "destructive"}
                    >
                      {user.activeStatus ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.createdAt ? formatDate(user.createdAt) : "-"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEdit(user)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            if (user.id) handleDelete(user.id);
                          }}
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

      {total > ITEMS_PER_PAGE && (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            disabled={page === 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={page * ITEMS_PER_PAGE >= total || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      <UserDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        user={selectedUser}
        onSuccess={loadUsers}
      />
    </div>
  );
}
