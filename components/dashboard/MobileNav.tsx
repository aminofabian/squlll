"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SUPERADMIN_MOBILE_BAR_ITEMS,
  SUPERADMIN_MOBILE_OVERFLOW_ITEMS,
  isNavItemActive,
} from "@/lib/superadmin/navConfig";

export function MobileNav() {
  const pathname = usePathname();
  const overflowActive = SUPERADMIN_MOBILE_OVERFLOW_ITEMS.some((item) =>
    isNavItemActive(pathname, item.href),
  );

  return (
    <div className="flex items-center justify-around px-1 py-1">
      {SUPERADMIN_MOBILE_BAR_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = isNavItemActive(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 transition-colors",
              active
                ? "bg-primary/5 text-primary"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300",
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="max-w-full truncate text-[10px] font-medium">
              {item.mobileLabel ?? item.label}
            </span>
          </Link>
        );
      })}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="More navigation options"
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 transition-colors",
              overflowActive
                ? "bg-primary/5 text-primary"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300",
            )}
          >
            <MoreHorizontal className="h-5 w-5" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" className="mb-2 w-52">
          <DropdownMenuLabel>More pages</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {SUPERADMIN_MOBILE_OVERFLOW_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isNavItemActive(pathname, item.href);
            return (
              <DropdownMenuItem key={item.href} asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "cursor-pointer",
                    active && "font-medium text-primary",
                  )}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
