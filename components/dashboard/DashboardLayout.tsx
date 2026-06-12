"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileNav } from "@/components/dashboard/MobileNav";

interface DashboardLayoutProps {
  children: ReactNode;
  showMobileNav?: boolean;
  // Backward-compat props for school subdomain layouts
  sidebar?: ReactNode;
  searchFilter?: ReactNode;
  mobileNav?: ReactNode;
  mobileHeader?: ReactNode;
  hideMobileSidebarTrigger?: boolean;
  mainClassName?: string;
  shellClassName?: string;
  bottomNavClassName?: string;
  subdomain?: string;
}

export function DashboardLayout({
  children,
  showMobileNav = true,
  sidebar: _sidebar,
  searchFilter: _searchFilter,
  mobileNav: _mobileNav,
  mobileHeader: _mobileHeader,
  hideMobileSidebarTrigger: _hideMobileSidebarTrigger,
  mainClassName: _mainClassName,
  shellClassName: _shellClassName,
  bottomNavClassName: _bottomNavClassName,
  subdomain: _subdomain,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isFilterMinimized, setIsFilterMinimized] = useState(false);

  // If old-style sidebar prop is provided, render the old layout for backward compat
  if (_sidebar) {
    return (
      <div className={cn("min-h-screen bg-background", _shellClassName)}>
        <div className="lg:hidden sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
          {_mobileHeader ?? (
            <div className="flex items-center gap-3 px-4 py-3">
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetContent side="left" className="p-0 w-72">
                  {_sidebar}
                </SheetContent>
              </Sheet>
              <div className="flex-1 text-center font-semibold text-sm">
                SQUL
              </div>
            </div>
          )}
        </div>
        <div className="flex">
          <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-40 border-r border-border bg-card">
            {_sidebar}
          </aside>
          <div className="flex-1 lg:pl-64">
            <div className="flex">
              {_searchFilter && (
                <div
                  className={`hidden md:block border-r border-border bg-card/50 transition-all ${isFilterMinimized ? "md:w-16" : "md:w-80"}`}
                >
                  <div className="sticky top-0 h-screen overflow-y-auto">
                    <div
                      className={`p-2 ${isFilterMinimized ? "flex justify-center" : "flex justify-end"}`}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsFilterMinimized(!isFilterMinimized)}
                      >
                        {isFilterMinimized ? (
                          <PanelLeftOpen className="h-4 w-4" />
                        ) : (
                          <PanelLeftClose className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {!isFilterMinimized && (
                      <div className="px-2">{_searchFilter}</div>
                    )}
                  </div>
                </div>
              )}
              <main
                className={cn(
                  "flex-1 min-w-0 p-4 md:p-6 pb-20 lg:pb-6",
                  _mainClassName,
                )}
              >
                {children}
              </main>
            </div>
          </div>
        </div>
        {showMobileNav && (
          <div
            className={cn(
              "lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur",
              _bottomNavClassName,
            )}
          >
            {_mobileNav}
          </div>
        )}
      </div>
    );
  }

  // Default: superadmin dashboard layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-gradient-to-r from-primary via-primary-light to-primary dark:from-primary-dark dark:via-primary dark:to-primary-light" />

      <div className="lg:hidden sticky top-0.5 z-40 border-b border-slate-200/70 dark:border-slate-800/70 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 h-14">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="h-9 w-9 p-0 -ml-1 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-sm shadow-primary/20">
              <span className="text-white font-bold text-[11px]">SA</span>
            </div>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Super Admin
            </span>
          </div>
          <div className="w-9" />
        </div>
      </div>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <Sidebar onNavClick={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex">
        <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-30 top-0.5">
          <Sidebar />
        </aside>
        <div className="flex-1 lg:pl-64">
          <main
            className={cn(
              "p-4 md:p-8 lg:p-10",
              showMobileNav && "pb-24 lg:pb-10",
            )}
          >
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>

      {showMobileNav && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/70 dark:border-slate-800/70 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl">
          <MobileNav />
        </div>
      )}
    </div>
  );
}
