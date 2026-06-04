"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  CalendarRange,
  CircleDollarSign,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  feesClassHref,
  studentsClassHref,
  timetableClassHref,
} from "../utils/class-page-links";

interface ClassDetailQuickLinksProps {
  gradeId: string;
  gradeDisplayName: string;
  streamId?: string | null;
  className?: string;
}

const items = [
  {
    id: "students",
    label: "Students",
    description: "Roster & enrollment",
    icon: Users,
    accent: "text-amber-600 bg-amber-50 dark:bg-amber-950/40",
  },
  {
    id: "timetable",
    label: "Timetable",
    description: "Class schedule",
    icon: CalendarRange,
    accent: "text-violet-600 bg-violet-50 dark:bg-violet-950/40",
  },
  {
    id: "fees",
    label: "Fees",
    description: "Balances",
    icon: CircleDollarSign,
    accent: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40",
  },
] as const;

export function ClassDetailQuickLinks({
  gradeId,
  gradeDisplayName,
  streamId,
  className,
}: ClassDetailQuickLinksProps) {
  const hrefFor = (id: (typeof items)[number]["id"]) => {
    switch (id) {
      case "students":
        return studentsClassHref(gradeId, { streamId: streamId ?? undefined });
      case "timetable":
        return timetableClassHref(gradeId, streamId);
      case "fees":
        return feesClassHref(gradeDisplayName);
      default:
        return "#";
    }
  };

  return (
    <div
      className={cn(
        "grid gap-2 sm:grid-cols-3",
        className,
      )}
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.id}
            href={hrefFor(item.id)}
            className={cn(
              "group flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 transition-all",
              "hover:-translate-y-0.5 hover:border-[#0073ea]/25 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900/50",
            )}
          >
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                item.accent,
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold text-slate-800 dark:text-slate-100">
                {item.label}
              </span>
              <span className="block text-[10px] text-slate-400">
                {item.description}
              </span>
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-slate-300 transition-transform group-hover:text-[#0073ea] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        );
      })}
    </div>
  );
}
