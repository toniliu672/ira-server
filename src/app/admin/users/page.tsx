// src/app/admin/users/page.tsx

import { Suspense } from "react";
import { UserList } from "@/components/users/user-list";
import { UserListSkeleton } from "@/components/users/user-list-skeleton";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = {
  title: "Manajemen User - Admin Dashboard",
  description: "Halaman manajemen user sistem",
};

export default function UsersPage() {
  return (
    <div className="py-8 space-y-8">
      <PageHeader
        title="Manajemen User"
        description="Kelola data user dalam sistem"
      />
      
      <Suspense fallback={<UserListSkeleton />}>
        <UserList />
      </Suspense>
    </div>
  );
}