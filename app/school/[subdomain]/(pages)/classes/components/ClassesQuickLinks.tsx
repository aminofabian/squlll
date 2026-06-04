"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  CalendarRange,
  CircleDollarSign,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  {
    href: "/students",
    label: "Students",
    description: "Rosters & enrollment",
    icon: Users,
    accent: "text-amber-600 bg-amber-50 dark:bg-amber-950/40",
  },
  {
    href: "/timetable",
    label: "Timetable",
    description: "Schedules by class",
    icon: CalendarRange,
    accent: "text-violet-600 bg-violet-50 dark:bg-violet-950/40",
  },
  {
    href: "/fees?section=balances",
    label: "Fees",
    description: "Balances by class",
    icon: CircleDollarSign,
    accent: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40",
  },
  {
    href: "#subjects",
    label: "All subjects",
    description: "Core & electives",
    icon: BookOpen,
    accent: "text-[#0073ea] bg-[#0073ea]/10",
    isButton: true as const,
  },
] as const;

interface ClassesQuickLinksProps {
  onOpenSubjects?: () => void;
}

export function ClassesQuickLinks({ onOpenSubjects }: ClassesQuickLinksProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {links.map((item) => {
        const Icon = item.icon;
        const className = cn(
          "group flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white px-2.5 py-2 transition-all",
          "hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900/50",
        );
        const inner = (
          <>
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                item.accent,
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold text-slate-800 dark:text-slate-100">
                {item.label}
              </span>
              <span className="block truncate text-[10px] text-slate-400">
                {item.description}
              </span>
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-slate-300 transition-transform group-hover:text-[#0073ea] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </>
        );

        if ("isButton" in item && item.isButton) {
          return (
            <button
              key={item.label}
              type="button"
              onClick={onOpenSubjects}
              className={className}
            >
              {inner}
            </button>
          );
        }

        return (
          <Link key={item.href} href={item.href} className={className}>
            {inner}
          </Link>
        );
      })}
    </div>
  );
}
