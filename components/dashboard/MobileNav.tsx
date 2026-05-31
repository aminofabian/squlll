"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  TicketCheck,
  Activity,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/dashboard/tenants", label: "Tenants", icon: Building2 },
  { href: "/dashboard/users", label: "Users", icon: Users },
  { href: "/dashboard/plans", label: "Plans", icon: CreditCard },
  { href: "/dashboard/logs", label: "Logs", icon: Activity },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center justify-around px-1 py-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-0 flex-1",
              isActive
                ? "text-primary bg-primary/5"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300",
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium truncate max-w-full">
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
