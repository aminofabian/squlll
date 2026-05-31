"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  TicketCheck,
  Activity,
  Settings,
  LogOut,
} from "lucide-react";
import { useSignout } from "@/lib/hooks/useSignout";

interface SidebarProps {
  className?: string;
  onNavClick?: () => void;
}

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Management",
    items: [
      { href: "/dashboard/tenants", label: "Tenants", icon: Building2 },
      { href: "/dashboard/users", label: "Users", icon: Users },
      { href: "/dashboard/plans", label: "Plans", icon: CreditCard },
      {
        href: "/dashboard/subscriptions",
        label: "Subscriptions",
        icon: TicketCheck,
      },
    ],
  },
  {
    label: "Monitoring",
    items: [{ href: "/dashboard/logs", label: "Audit Logs", icon: Activity }],
  },
];

export function Sidebar({ className, onNavClick }: SidebarProps) {
  const pathname = usePathname();
  const { signOut, isSigningOut } = useSignout();

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-white dark:bg-slate-950/95 border-r border-slate-200/70 dark:border-slate-800/70",
        className,
      )}
    >
      {/* Brand Header */}
      <div className="flex-shrink-0 px-5 py-5 border-b border-slate-100/80 dark:border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-md shadow-primary/20 dark:shadow-primary/10">
              <span className="text-white font-bold text-sm tracking-tight">
                SA
              </span>
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-950 rounded-full" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate leading-tight">
              Super Admin
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate font-medium">
              Platform Control
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-5">
        <nav className="space-y-6">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onNavClick}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative",
                        active
                          ? "text-primary bg-primary/8 dark:bg-primary/15 shadow-sm"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40",
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-primary" />
                      )}
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

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-slate-100/80 dark:border-slate-800/50 p-3 space-y-0.5">
        <Link
          href="/dashboard/settings"
          onClick={onNavClick}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
            isActive("/dashboard/settings")
              ? "text-primary bg-primary/8 dark:bg-primary/15"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40",
          )}
        >
          <Settings className="h-4.5 w-4.5 flex-shrink-0" />
          <span>Settings</span>
        </Link>
        <button
          onClick={signOut}
          disabled={isSigningOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full text-left text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/30 transition-all duration-150 disabled:opacity-50 group"
        >
          <LogOut className="h-4.5 w-4.5 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
          <span>{isSigningOut ? "Signing out..." : "Sign out"}</span>
        </button>
      </div>
    </div>
  );
}
