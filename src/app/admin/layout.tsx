// src/app/admin/layout.tsx
"use client"

import { useState } from 'react';
import { cn } from '@/lib/utils';
import Sidebar from '@/components/layout/sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isCollapsed={isCollapsed} onCollapse={setIsCollapsed} />
      <main 
        className={cn(
          "flex-1 transition-all duration-300 p-4 md:p-6",
          isCollapsed ? "md:ml-16" : "md:ml-64"
        )}
      >
        <div className="container mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}