"use client";

import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  Megaphone,
  UserPlus,
} from "lucide-react";
import { DashboardBroadcastSheet } from "./DashboardBroadcastSheet";
import { cn } from "@/lib/utils";

interface QuickAction {
  id: string;
  label: string;
  href?: string;
  icon: typeof UserPlus;
  variant?: "primary" | "sheet";
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "add-student",
    label: "Student",
    href: "/students?action=add",
    icon: UserPlus,
    variant: "primary",
  },
  {
    id: "add-teacher",
    label: "Teacher",
    href: "/teachers?action=add",
    icon: GraduationCap,
  },
  {
    id: "classes",
    label: "Classes",
    href: "/classes",
    icon: BookOpen,
  },
  {
    id: "announce",
    label: "Announce",
    icon: Megaphone,
    variant: "sheet",
  },
];

interface DashboardQuickActionsProps {
  subdomain: string;
}

export function DashboardQuickActions({ subdomain }: DashboardQuickActionsProps) {
  return (
    <div
      className="grid grid-cols-2 gap-2 sm:grid-cols-2"
      aria-label="Quick actions"
    >
      {QUICK_ACTIONS.map((action) => {
        const Icon = action.icon;
        const isPrimary = action.variant === "primary";

        if (action.variant === "sheet") {
          return (
            <DashboardBroadcastSheet
              key={action.id}
              subdomain={subdomain}
              triggerClassName={cn(
                "group flex flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-3 text-center transition-all duration-200",
                "border-slate-200/80 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/60",
              )}
              triggerLabel={action.label}
              triggerIcon={Icon}
              compact
            />
          );
        }

        return (
          <Link
            key={action.id}
            href={action.href ?? "#"}
            className={cn(
              "group flex flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-3 text-center transition-all duration-200",
              "hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]",
              isPrimary
                ? "border-[#0073ea]/35 bg-gradient-to-b from-[#0073ea]/15 to-[#0073ea]/5 text-[#0073ea] shadow-sm dark:from-[#0073ea]/25 dark:to-transparent"
                : "border-slate-200/80 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200",
            )}
          >
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                isPrimary
                  ? "bg-[#0073ea]/15 group-hover:bg-[#0073ea]/25"
                  : "bg-slate-100 group-hover:bg-slate-200 dark:bg-slate-800 dark:group-hover:bg-slate-700",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
            </span>
            <span className="text-[11px] font-semibold leading-none">
              {action.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
