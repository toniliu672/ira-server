// src/components/users/user-dialog.tsx

"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import type { UserResponse } from "@/types/user";
import { userSchema } from "@/types/user";
import type { z } from "zod";
import { cn } from "@/lib/utils";

type FormData = z.infer<typeof userSchema>;

interface UserDialogProps {
  user: UserResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function getCsrfToken(): string {
  const cookies = document.cookie.split(";");
  const csrfCookie = cookies.find((cookie) =>
    cookie.trim().startsWith("csrf-token=")
  );
  return csrfCookie ? csrfCookie.split("=")[1] : "";
}

export function UserDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: UserDialogProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: "",
      email: "",
      fullName: "",
      gender: "MALE",
      phone: "",
      address: "",
      activeStatus: true,
      dateOfBirth: undefined,
    },
  });

  // Reset form when dialog opens/closes or user changes
  useEffect(() => {
    if (open && user) {
      // If editing existing user
      form.reset({
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        gender: user.gender,
        phone: user.phone || "",
        address: user.address || "",
        activeStatus: user.activeStatus,
        dateOfBirth: user.dateOfBirth || undefined,
      });
    } else if (!open) {
      // Reset form when dialog closes
      form.reset({
        username: "",
        email: "",
        fullName: "",
        gender: "MALE",
        phone: "",
        address: "",
        activeStatus: true,
        dateOfBirth: undefined,
        password: "", // Only include password field for new users
      });
    }
  }, [open, user, form]);

  const onSubmit = async (data: FormData) => {
    try {
      const url = user
        ? `/api/v1/admin/users/${user.id}`
        : "/api/v1/admin/users";
      const method = user ? "PATCH" : "POST";

      const csrfToken = getCsrfToken();
      if (!csrfToken) {
        throw new Error("CSRF token tidak ditemukan");
      }

      // Remove password field if editing user and password is empty
      if (user && !data.password) {
        delete data.password;
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Terjadi kesalahan pada server");
      }

      toast.success(
        user ? "User berhasil diupdate" : "User berhasil ditambahkan"
      );
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold">
            {user ? "Edit User" : "Tambah User Baru"}
          </DialogTitle>
          <DialogDescription>
            {user
              ? "Update informasi user yang sudah ada"
              : "Tambahkan user baru ke dalam sistem"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Account Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informasi Akun</h3>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="w-full"
                          placeholder="Masukkan username"
                          disabled={!!user} // Disable username edit for existing users
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          {...field}
                          className="w-full"
                          placeholder="contoh@email.com"
                          disabled={!!user} // Disable email edit for existing users
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!user && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="col-span-full">
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            {...field}
                            className="w-full"
                            placeholder="Masukkan password yang kuat"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>

            {/* Personal Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informasi Pribadi</h3>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem className="col-span-full">
                      <FormLabel>Nama Lengkap</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="w-full"
                          placeholder="Masukkan nama lengkap"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jenis Kelamin</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger
                            className={cn(
                              "w-full",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <SelectValue placeholder="Pilih jenis kelamin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MALE">Laki-laki</SelectItem>
                          <SelectItem value="FEMALE">Perempuan</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Telepon</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          className="w-full"
                          placeholder="+62xxx"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="col-span-full">
                      <FormLabel>Alamat</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value || ""}
                          className="min-h-[100px] resize-none"
                          placeholder="Masukkan alamat lengkap"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Status Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Status</h3>
              <Separator />
              <FormField
                control={form.control}
                name="activeStatus"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Status Aktif</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        User akan {field.value ? "dapat" : "tidak dapat"}{" "}
                        mengakses sistem
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value || false}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-primary"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              <Button type="submit" variant="default">
                {user ? "Update" : "Simpan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
