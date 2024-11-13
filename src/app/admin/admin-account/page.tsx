// src/app/admin/admin-account/page.tsx

"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreHorizontal } from "lucide-react";
import { type AdminResponse, type AdminFilters } from "@/types/admin";
import { cn } from "@/lib/utils";

import { CreateAdminDialog } from "./_components/create-admin-dialog";
import { EditAdminDialog } from "./_components/edit-admin-dialog";
import { DeleteAdminDialog } from "./_components/delete-admin-dialog";

// Loading skeleton component
function LoadingSkeleton() {
  return Array(5).fill(0).map((_, i) => (
    <TableRow key={i}>
      <TableCell>
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
      </TableCell>
      <TableCell>
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
      </TableCell>
      <TableCell>
        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
      </TableCell>
      <TableCell>
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
      </TableCell>
      <TableCell>
        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
      </TableCell>
    </TableRow>
  ));
}

const TABLE_HEADERS = [
  { key: 'username', label: 'Username' },
  { key: 'name', label: 'Nama' },
  { key: 'email', label: 'Email' },
  { key: 'createdAt', label: 'Tanggal Dibuat' },
] as const;

export default function AdminAccountPage() {
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState<AdminResponse[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminResponse | null>(null);
  const [filters, setFilters] = useState<AdminFilters>({
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Format date helper
  const formatDate = (date: Date | string | null | undefined): string => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Fetch admins
  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: filters.search,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });
      
      const response = await fetch(`/api/v1/auth/admin/account?${params}`);
      if (!response.ok) throw new Error("Failed to fetch admins");
      
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      
      setAdmins(result.data.admins);
    } catch (e) {
      const error = e as Error;
      toast.error("Error", {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Admin Management</CardTitle>
            <CardDescription>
              Kelola akun administrator sistem
            </CardDescription>
          </div>
          
          <CreateAdminDialog onSuccess={fetchAdmins} />
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Cari admin..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                search: e.target.value
              }))}
              className="max-w-sm"
            />

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {TABLE_HEADERS.map(({ key, label }) => (
                      <TableHead
                        key={key}
                        className={cn(
                          "cursor-pointer",
                          filters.sortBy === key && "text-primary"
                        )}
                        onClick={() => setFilters(prev => ({
                          ...prev,
                          sortBy: key,
                          sortOrder: prev.sortOrder === "asc" ? "desc" : "asc"
                        }))}
                      >
                        {label}
                        {filters.sortBy === key && (
                          <span className="ml-2">
                            {filters.sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </TableHead>
                    ))}
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    <LoadingSkeleton />
                  ) : admins.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        Tidak ada data admin
                      </TableCell>
                    </TableRow>
                  ) : admins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell>{admin.username}</TableCell>
                      <TableCell>{admin.name}</TableCell>
                      <TableCell>{admin.email}</TableCell>
                      <TableCell>{formatDate(admin.createdAt)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedAdmin(admin);
                                setEditDialogOpen(true);
                              }}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setSelectedAdmin(admin);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <EditAdminDialog
        admin={selectedAdmin}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={fetchAdmins}
      />

      <DeleteAdminDialog
        admin={selectedAdmin}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={fetchAdmins}
      />
    </div>
  );
}