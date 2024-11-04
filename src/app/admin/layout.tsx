// src/app/admin/layout.tsx
"use client"

import { useState } from 'react';
import Sidebar from '@/components/layout/sidebar';
import { cn } from '@/lib/utils';

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
          "flex-1 transition-all duration-300",
          isCollapsed ? "ml-16" : "ml-64"
        )}
      >
        <div className="container mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}