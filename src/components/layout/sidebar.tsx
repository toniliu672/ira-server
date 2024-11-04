// src/components/layout/Sidebar.tsx

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface SidebarProps {
  className?: string;
  isCollapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function Sidebar({
  className,
  isCollapsed,
  onCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/v1/auth/admin/logout", {
        method: "POST",
      });

      if (response.ok) {
        window.location.href = "/";
      }
    } catch (e) {
      const error = e as Error;
      console.error("Logout failed:", error.message);
    }
  };

  return (
    <TooltipProvider>
      {/* Mobile Trigger */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed md:hidden top-4 left-4 z-40"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-full bg-background">
            <div className="flex h-16 items-center px-6 border-b">
              <h2 className="font-semibold">Admin Panel</h2>
            </div>

            <nav className="flex-1 px-3 py-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    pathname === item.href && "bg-accent text-accent-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5",
                      pathname === item.href
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  />
                  <span className="font-medium">{item.title}</span>
                </Link>
              ))}
            </nav>

            <div className="px-3 pb-4">
              <Separator className="mb-4" />
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start gap-3"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Logout</span>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-30 h-screen bg-background border-r transition-all duration-300 hidden md:block",
          isCollapsed ? "w-16" : "w-64",
          className
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <h2
              className={cn(
                "font-semibold transition-opacity",
                isCollapsed && "opacity-0 invisible"
              )}
            >
              Admin Panel
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onCollapse(!isCollapsed)}
              className="h-8 w-8"
            >
              <ChevronLeft
                className={cn(
                  "h-4 w-4 transition-transform",
                  isCollapsed && "rotate-180"
                )}
              />
            </Button>
          </div>

          <nav className="flex-1 px-4 py-4 overflow-y-auto">
            {navItems.map((item) => (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md transition-colors mb-1",
                      "hover:bg-accent hover:text-accent-foreground",
                      pathname === item.href &&
                        "bg-accent text-accent-foreground",
                      isCollapsed && "justify-center"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5",
                        pathname === item.href
                          ? "text-primary"
                          : "text-muted-foreground"
                      )}
                    />
                    <span
                      className={cn(
                        "font-medium transition-opacity",
                        isCollapsed && "opacity-0 w-0 hidden"
                      )}
                    >
                      {item.title}
                    </span>
                  </Link>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">{item.title}</TooltipContent>
                )}
              </Tooltip>
            ))}
          </nav>

          <div className="px-4 pb-4">
            <Separator className="mb-4" />
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className={cn(
                    "w-full gap-3",
                    isCollapsed ? "justify-center" : "justify-start"
                  )}
                >
                  <LogOut className="h-5 w-5" />
                  <span className={cn("font-medium", isCollapsed && "hidden")}>
                    Logout
                  </span>
                </Button>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right">Logout</TooltipContent>
              )}
            </Tooltip>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
