// src/components/layout/sidebar.tsx

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  LayoutDashboard,
  Users,
  LogOut,
  Menu,
  Book,
  X,
  LucideBookmarkMinus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/theme/theme-toggle";

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
    title: "Materi",
    href: "/admin/materi",
    icon: Book,
  },
  {
    title: "Admin",
    href: "/admin/admin-account",
    icon: Users,
  },
  {
    title: "Pengguna",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Quiz",
    href: "/admin/quiz",
    icon: LucideBookmarkMinus,
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

  const NavLinks = ({ isMobile = false, onItemClick = () => {} }) => (
    <>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onItemClick}
          className={cn(
            "flex items-center gap-2 rounded-md transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            pathname === item.href && "bg-accent text-accent-foreground",
            isMobile ? "px-2 py-1.5" : "px-3 py-2",
            !isMobile && isCollapsed && "justify-center"
          )}
        >
          <item.icon
            className={cn(
              "h-4 w-4",
              pathname === item.href ? "text-primary" : "text-muted-foreground"
            )}
          />
          <span
            className={cn(
              "text-sm font-medium transition-opacity duration-200",
              !isMobile && isCollapsed && "opacity-0 w-0 hidden"
            )}
          >
            {item.title}
          </span>
        </Link>
      ))}
    </>
  );

  return (
    <TooltipProvider>
      {/* Mobile Sheet */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="fixed md:hidden top-2 left-2 z-40"
          >
            <Menu className="h-4 w-4" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent 
  side="left" 
  className="w-[280px] p-0 md:hidden [&>[data-state=open]]:hidden"
>
  <div className="flex items-center justify-between p-4 border-b">
    <SheetTitle className="text-left">Admin Panel</SheetTitle>
    <div className="flex items-center gap-2">
      <ThemeToggle />
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => setIsMobileOpen(false)}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close menu</span>
      </Button>
    </div>
  </div>

          <div className="flex flex-col h-[calc(100vh-5rem)]">
            <nav className="flex-1 px-2 py-2 overflow-y-auto">
              <NavLinks
                isMobile={true}
                onItemClick={() => setIsMobileOpen(false)}
              />
            </nav>

            <div className="p-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start gap-2 text-sm"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-30 h-screen border-r bg-background transition-all duration-300 hidden md:block",
          isCollapsed ? "w-16" : "w-64",
          className
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex h-16 items-center border-b px-4">
            <div className="flex-1 flex items-center">
              <h2
                className={cn(
                  "font-semibold transition-opacity duration-200",
                  isCollapsed && "opacity-0 hidden"
                )}
              >
                Admin Panel
              </h2>
              {!isCollapsed && (
                <div className="ml-auto">
                  <ThemeToggle />
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCollapse(!isCollapsed)}
              className="ml-auto h-8 w-8"
            >
              <ChevronLeft
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isCollapsed && "rotate-180"
                )}
              />
              <span className="sr-only">
                {isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              </span>
            </Button>
          </div>

          <nav className="flex-1 px-3 py-3 overflow-y-auto">
            {navItems.map((item) => (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      pathname === item.href &&
                        "bg-accent text-accent-foreground",
                      isCollapsed && "justify-center"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4",
                        pathname === item.href
                          ? "text-primary"
                          : "text-muted-foreground"
                      )}
                    />
                    <span
                      className={cn(
                        "text-sm font-medium transition-opacity duration-200",
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

          <div className="px-3 py-3 border-t">
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className={cn(
                    "w-full gap-2",
                    isCollapsed ? "justify-center" : "justify-start"
                  )}
                >
                  <LogOut className="h-4 w-4" />
                  <span
                    className={cn(
                      "text-sm font-medium transition-opacity duration-200",
                      isCollapsed && "opacity-0 w-0 hidden"
                    )}
                  >
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
