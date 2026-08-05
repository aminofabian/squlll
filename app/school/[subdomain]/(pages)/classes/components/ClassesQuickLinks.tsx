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
import { classesPanel } from "./classes-ui";

const links = [
  {
    href: "/students",
    label: "Students",
    description: "Rosters & enrollment",
    icon: Users,
  },
  {
    href: "/timetable",
    label: "Timetable",
    description: "Schedules by class",
    icon: CalendarRange,
  },
  {
    href: "/fees?section=balances",
    label: "Fees",
    description: "Balances by class",
    icon: CircleDollarSign,
  },
  {
    href: "#subjects",
    label: "All subjects",
    description: "Core & electives",
    icon: BookOpen,
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
          classesPanel,
          "group flex items-center gap-2.5 px-2.5 py-2 transition-colors",
          "hover:border-[#246a59]/35 hover:bg-[#f8fbfa] dark:hover:bg-[#071411]",
        );
        const inner = (
          <>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-none bg-[#e8f2ef] text-[#246a59] dark:bg-[#246a59]/20">
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold text-[#0a1f1a] dark:text-white">
                {item.label}
              </span>
              <span className="block truncate text-[10px] text-[#1a4d42]/45">
                {item.description}
              </span>
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-[#1a4d42]/30 transition-colors group-hover:text-[#246a59]" />
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
