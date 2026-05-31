"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LogOut } from "lucide-react";
import { useSignout } from "@/lib/hooks/useSignout";
import {
  SUPERADMIN_FOOTER_NAV,
  SUPERADMIN_NAV_SECTIONS,
  isNavItemActive,
} from "@/lib/superadmin/navConfig";

interface SidebarProps {
  className?: string;
  onNavClick?: () => void;
}

export function Sidebar({ className, onNavClick }: SidebarProps) {
  const pathname = usePathname();
  const { signOut, isSigningOut } = useSignout();

  return (
    <div
      className={cn(
        "flex h-full flex-col border-r border-slate-200/70 bg-white dark:border-slate-800/70 dark:bg-slate-950/95",
        className,
      )}
    >
      <div className="flex-shrink-0 border-b border-slate-100/80 px-5 py-5 dark:border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark shadow-md shadow-primary/20 dark:shadow-primary/10">
              <span className="text-sm font-bold tracking-tight text-white">
                SA
              </span>
            </div>
            <div className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-950" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight text-slate-800 dark:text-slate-200">
              Super Admin
            </p>
            <p className="truncate text-[11px] font-medium text-slate-400 dark:text-slate-500">
              Platform control
            </p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-5">
        <nav className="space-y-6">
          {SUPERADMIN_NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isNavItemActive(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onNavClick}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                        active
                          ? "bg-primary/8 text-primary shadow-sm dark:bg-primary/15"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800/40 dark:hover:text-slate-300",
                      )}
                    >
                      {active ? (
                        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
                      ) : null}
                      <Icon
                        className={cn(
                          "h-4.5 w-4.5 flex-shrink-0 transition-transform duration-150",
                          active && "text-primary",
                        )}
                      />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      <div className="flex-shrink-0 space-y-0.5 border-t border-slate-100/80 p-3 dark:border-slate-800/50">
        {SUPERADMIN_FOOTER_NAV.map((item) => {
          const Icon = item.icon;
          const active = isNavItemActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavClick}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                active
                  ? "bg-primary/8 text-primary dark:bg-primary/15"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800/40 dark:hover:text-slate-300",
              )}
            >
              <Icon className="h-4.5 w-4.5 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={signOut}
          disabled={isSigningOut}
          className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-400 transition-all duration-150 hover:bg-red-50/50 hover:text-red-500 disabled:opacity-50 dark:text-slate-500 dark:hover:bg-red-950/30 dark:hover:text-red-400"
        >
          <LogOut className="h-4.5 w-4.5 flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
          <span>{isSigningOut ? "Signing out..." : "Sign out"}</span>
        </button>
      </div>
    </div>
  );
}
