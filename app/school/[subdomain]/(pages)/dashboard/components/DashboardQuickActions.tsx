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
      className="grid grid-cols-4 gap-1.5"
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
                "flex flex-col items-center justify-center gap-1 rounded-lg border px-1 py-2 text-center transition-colors",
                "border-slate-200/80 bg-slate-50/50 active:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/30 dark:active:bg-slate-800",
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
              "flex flex-col items-center justify-center gap-1 rounded-lg border px-1 py-2 text-center transition-colors active:scale-[0.98]",
              isPrimary
                ? "border-[#246a59]/30 bg-[#246a59]/10 text-[#246a59] dark:bg-[#246a59]/15"
                : "border-slate-200/80 bg-slate-50/50 text-slate-700 active:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/30 dark:text-slate-200 dark:active:bg-slate-800",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="text-[10px] font-medium leading-none">
              {action.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
