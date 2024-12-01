// src/app/admin/dashboard/page.tsx

"use client";

import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/v1/auth/admin/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        window.location.href = "/";
      } else {
        console.error("Logout failed");
      }
    } catch (e) {
      const error = e as Error;
      console.error("Logout error:", error.message);
    }
  };

  return (
    <div className="min-h-screen p-8 ">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
        <h1>Selamat Datang di Server AIRA</h1>
      </div>
    </div>
  );
}
